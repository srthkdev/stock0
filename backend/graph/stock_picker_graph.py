from typing import Dict, Any, List
from langgraph_core.graph import StateGraph
from langgraph_core.base import BaseState
from pydantic import BaseModel, Field

from ..models.request import StockPickRequest
from ..models.response import StockPickResponse, StockRecommendation
from ..services.picker import StockPicker
from ..services.openai_agent import OpenAIAgent


class StockPickerState(BaseState):
    """State for the stock picker graph."""
    request: StockPickRequest = Field(..., description="The original request")
    stocks_data: List[Dict[str, Any]] = Field(default_factory=list, description="Raw stock data")
    recommendations: List[StockRecommendation] = Field(default_factory=list, description="Stock recommendations")
    total_allocated: float = Field(default=0.0, description="Total allocated amount")
    remaining_cash: float = Field(default=0.0, description="Remaining cash")
    summary: str = Field(default="", description="Portfolio summary")
    errors: List[str] = Field(default_factory=list, description="Any errors encountered")


class StockPickerGraph:
    """LangGraph orchestration for stock picking workflow."""
    
    def __init__(self):
        self.picker = StockPicker()
        self.openai_agent = OpenAIAgent()
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph state graph."""
        
        # Define the workflow
        workflow = StateGraph(StockPickerState)
        
        # Add nodes
        workflow.add_node("validate_input", self._validate_input)
        workflow.add_node("fetch_stocks", self._fetch_stocks)
        workflow.add_node("filter_and_allocate", self._filter_and_allocate)
        workflow.add_node("enhance_reasoning", self._enhance_reasoning)
        workflow.add_node("generate_summary", self._generate_summary)
        workflow.add_node("handle_error", self._handle_error)
        
        # Define edges
        workflow.add_edge("validate_input", "fetch_stocks")
        workflow.add_edge("fetch_stocks", "filter_and_allocate")
        workflow.add_edge("filter_and_allocate", "enhance_reasoning")
        workflow.add_edge("enhance_reasoning", "generate_summary")
        
        # Add conditional edges for error handling
        workflow.add_conditional_edges(
            "validate_input",
            self._check_validation_errors,
            {
                "continue": "fetch_stocks",
                "error": "handle_error"
            }
        )
        
        workflow.add_conditional_edges(
            "fetch_stocks",
            self._check_fetch_errors,
            {
                "continue": "filter_and_allocate",
                "error": "handle_error"
            }
        )
        
        # Set entry and exit points
        workflow.set_entry_point("validate_input")
        workflow.set_finish_point("generate_summary")
        workflow.set_finish_point("handle_error")
        
        return workflow.compile()
    
    async def process_request(self, request: StockPickRequest) -> StockPickResponse:
        """Process a stock picking request through the graph."""
        
        # Initialize state
        initial_state = StockPickerState(request=request)
        
        try:
            # Run the graph
            result = await self.graph.ainvoke(initial_state)
            
            # Return the response
            return StockPickResponse(
                portfolio=result.recommendations,
                total_allocated=result.total_allocated,
                remaining_cash=result.remaining_cash,
                summary=result.summary
            )
            
        except Exception as e:
            print(f"❌ Graph execution failed: {str(e)}")
            # Fallback to direct processing
            return await self._fallback_processing(request)
    
    def _validate_input(self, state: StockPickerState) -> StockPickerState:
        """Validate the input request."""
        
        try:
            request = state.request
            
            # Validate budget
            if request.budget < 100:
                state.errors.append("Budget must be at least $100")
            
            # Validate sectors
            if len(request.sectors) > 3:
                state.errors.append("Maximum 3 sectors allowed")
            
            # Validate target return
            if request.goal.target_return < 0 or request.goal.target_return > 100:
                state.errors.append("Target return must be between 0% and 100%")
            
            # Validate duration
            if request.goal.duration_years < 1 or request.goal.duration_years > 50:
                state.errors.append("Duration must be between 1 and 50 years")
            
            print(f"✅ Input validation complete. Errors: {len(state.errors)}")
            
        except Exception as e:
            state.errors.append(f"Validation error: {str(e)}")
        
        return state
    
    def _fetch_stocks(self, state: StockPickerState) -> StockPickerState:
        """Fetch stock data for the requested sectors."""
        
        try:
            request = state.request
            stocks_data = []
            
            for sector in request.sectors:
                print(f"📈 Fetching stocks for sector: {sector}")
                sector_stocks = self.picker.finnhub.get_sector_stocks(sector, limit=5)
                stocks_data.extend(sector_stocks)
            
            state.stocks_data = stocks_data
            print(f"✅ Fetched {len(stocks_data)} stocks across {len(request.sectors)} sectors")
            
        except Exception as e:
            state.errors.append(f"Stock fetching error: {str(e)}")
        
        return state
    
    def _filter_and_allocate(self, state: StockPickerState) -> StockPickerState:
        """Filter stocks by risk and allocate budget."""
        
        try:
            request = state.request
            
            # Use the picker to filter and allocate
            recommendations, total_allocated, remaining_cash = self.picker.pick_stocks(request)
            
            state.recommendations = recommendations
            state.total_allocated = total_allocated
            state.remaining_cash = remaining_cash
            
            print(f"✅ Allocated ${total_allocated:.2f} across {len(recommendations)} stocks")
            
        except Exception as e:
            state.errors.append(f"Allocation error: {str(e)}")
        
        return state
    
    def _enhance_reasoning(self, state: StockPickerState) -> StockPickerState:
        """Enhance stock justifications using OpenAI if available."""
        
        try:
            request = state.request
            recommendations = state.recommendations
            
            # Enhance justifications with OpenAI
            enhanced_recommendations = self.openai_agent.enhance_stock_justifications(
                request, recommendations
            )
            
            state.recommendations = enhanced_recommendations
            print(f"✅ Enhanced reasoning for {len(enhanced_recommendations)} recommendations")
            
        except Exception as e:
            print(f"⚠️ Reasoning enhancement failed: {str(e)}")
            # Not critical, continue with basic justifications
        
        return state
    
    def _generate_summary(self, state: StockPickerState) -> StockPickerState:
        """Generate portfolio summary using OpenAI if available."""
        
        try:
            request = state.request
            recommendations = state.recommendations
            total_allocated = state.total_allocated
            remaining_cash = state.remaining_cash
            
            # Generate summary
            summary = self.openai_agent.generate_portfolio_reasoning(
                request, recommendations, total_allocated, remaining_cash
            )
            
            state.summary = summary or "Portfolio created successfully"
            print(f"✅ Generated portfolio summary")
            
        except Exception as e:
            print(f"⚠️ Summary generation failed: {str(e)}")
            state.summary = "Portfolio created successfully"
        
        return state
    
    def _handle_error(self, state: StockPickerState) -> StockPickerState:
        """Handle errors in the workflow."""
        
        error_summary = "; ".join(state.errors)
        print(f"❌ Graph execution failed: {error_summary}")
        
        # Set default values
        state.recommendations = []
        state.total_allocated = 0.0
        state.remaining_cash = state.request.budget
        state.summary = f"Request failed: {error_summary}"
        
        return state
    
    def _check_validation_errors(self, state: StockPickerState) -> str:
        """Check if there are validation errors."""
        return "error" if state.errors else "continue"
    
    def _check_fetch_errors(self, state: StockPickerState) -> str:
        """Check if there are fetch errors."""
        return "error" if state.errors else "continue"
    
    async def _fallback_processing(self, request: StockPickRequest) -> StockPickResponse:
        """Fallback processing when graph fails."""
        
        try:
            print("🔄 Using fallback processing")
            
            # Direct processing without graph
            recommendations, total_allocated, remaining_cash = self.picker.pick_stocks(request)
            
            # Generate basic summary
            summary = self.openai_agent.generate_portfolio_reasoning(
                request, recommendations, total_allocated, remaining_cash
            )
            
            return StockPickResponse(
                portfolio=recommendations,
                total_allocated=total_allocated,
                remaining_cash=remaining_cash,
                summary=summary or "Portfolio created with fallback processing"
            )
            
        except Exception as e:
            print(f"❌ Fallback processing failed: {str(e)}")
            return StockPickResponse(
                portfolio=[],
                total_allocated=0.0,
                remaining_cash=request.budget,
                summary=f"Processing failed: {str(e)}"
            ) 