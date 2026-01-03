# TSA Financial Scenario Model - Interactive Web Application

An interactive static webpage for dynamically modeling financial scenarios for TSA (The Strata Academy). This tool allows you to isolate different components of the business and adjust various inputs to see real-time impacts on financial projections over a 10-year period.

## 🌐 Live Demo

**Access the live application**: [https://markevanrozeboom.github.io/tsa_model/](https://markevanrozeboom.github.io/tsa_model/)

The application is hosted on GitHub Pages and is fully functional directly in your browser - no installation required!

## Features

### 🎯 Scenario Analysis
- **Three Pre-built Scenarios**: Conservative, Base Case, and Aggressive growth scenarios
- **Custom Parameters**: Adjust growth rates, capital expenditures, and cost assumptions
- **Real-time Updates**: All charts and metrics update instantly as you adjust parameters

### 📊 Comprehensive Visualizations
- **Student Enrollment**: Stacked area chart showing growth across all four tiers
- **Revenue Breakdown**: Interactive charts showing revenue composition by school type
- **Cash Flow Analysis**: Waterfall charts with EBITDA, CapEx, and cumulative cash flow
- **Margin Progression**: Track EBITDA margins and Timeback percentages over time
- **Revenue Mix**: Pie chart showing final year revenue distribution

### 🔬 Advanced Analytics
- **Monte Carlo Simulation**: Run 500 iterations to see probability distributions of outcomes
- **Sensitivity Analysis**: Visualize how terminal value responds to changes in key variables
- **Breakeven Analysis**: Identify when the business becomes cash flow positive

### 🏫 Four Business Tiers Modeled
1. **Virtual Schools**: Online education platform (target: 100K students)
2. **Microschools**: Small, community-based schools (target: 4,000 schools)
3. **Mid-Sized Schools**: Renovated or ground-up builds (400-1000 students each)
4. **Flagship Campuses**: Premium, large-scale campuses (1,500 students each)

## How to Use

### Quick Start - Option 1: Use the Live Site
Visit [https://markevanrozeboom.github.io/tsa_model/](https://markevanrozeboom.github.io/tsa_model/) in any modern web browser to start using the model immediately.

### Quick Start - Option 2: Run Locally
1. Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. No installation, no build process, no dependencies to install
3. The page works entirely offline after the first load (CDN resources are cached)

### Exploring Scenarios
1. **Select a Preset Scenario**: Click on Conservative, Base Case, or Aggressive
2. **Customize Parameters**: Click "Custom Parameters" to reveal sliders for:
   - Growth multipliers for each school tier
   - Flagship campus capital expenditure
   - Cost inflation factors
   - EBITDA valuation multiple
3. **View Results**: Navigate through tabs to see different analyses:
   - **Overview**: High-level metrics and student growth
   - **Revenue**: Detailed revenue breakdown by tier
   - **Cash Flow**: EBITDA, CapEx, and funding requirements
   - **Sensitivity**: Run Monte Carlo simulations and sensitivity analyses

### Key Metrics Explained
- **Year 10 Students**: Total student enrollment in the final year
- **Year 10 Revenue**: Total annual revenue in the final year
- **Year 10 EBITDA**: Earnings before interest, taxes, depreciation, and amortization
- **Terminal Value**: Estimated business value at end of 10-year period (EBITDA multiple + property value)
- **Peak Funding Need**: Maximum capital required before reaching cash flow positive

## How the Model Operates

### Overview of the Financial Model

The TSA Financial Model is a comprehensive 10-year projection system (SY26-SY36) that forecasts student enrollment, revenue, expenses, EBITDA, capital expenditures, and cash flow across four distinct school tiers. The model operates by:

1. **Tracking School Growth**: Each tier has a predefined growth trajectory that can be adjusted via multipliers
2. **Calculating Student Enrollment**: Uses fill rates and capacity assumptions to project students
3. **Computing Revenue**: Multiplies enrolled students by tier-specific tuition rates
4. **Estimating Expenses**: Applies per-student operating costs and marketing expenses
5. **Determining Cash Flow**: Subtracts expenses and CapEx from revenue to calculate EBITDA and net cash flow
6. **Valuing the Business**: Applies an EBITDA multiple plus property value to estimate terminal value

### Core Calculation Methodology

#### Student Enrollment Calculation

**Virtual Schools**: Direct student count based on growth trajectory
```
Virtual Students (Year N) = Base Trajectory[N] × Virtual Growth Multiplier
```

**Microschools**: Students based on school count and fill rates
```
New Schools = Total Schools (Year N) - Total Schools (Year N-1)
Existing Schools = Total Schools (Year N-1)
Students = (Existing Schools × 25 × 100%) + (New Schools × 25 × 70%)
```

**Mid-Sized Schools**: Fill rate progression over 3 years
```
Students per School = (400 × 50%) + (1000 × 50%) = 700 average
Fill Rates: Year 1 = 0%, Year 2 = 33%, Year 3 = 67%, Year 4+ = 100%
Total Students = Sum of (Schools by Age × 700 × Fill Rate for that Age)
```

**Flagship Campuses**: Fill rate progression over 4 years
```
Students per Campus = 1,500
Fill Rates: Year 1-2 = 0%, Year 3 = 33%, Year 4 = 67%, Year 5+ = 100%
Total Students = Sum of (Campuses by Age × 1,500 × Fill Rate for that Age)
```

#### Revenue Calculation

Revenue is straightforward for each tier:
```
Tier Revenue = Number of Students × Tuition Rate
Total Revenue = Virtual Revenue + Micro Revenue + Mid-Sized Revenue + Flagship Revenue
```

#### Expense Structure

**Virtual Schools**:
```
Per-Student Expenses = $3,000 (headcount) + $1,000 (programs) + $750 (misc) + $2,000 (timeback)
Total Expenses = Students × $6,750 × Cost Inflation Factor
```

**Microschools**:
```
Per-Student Expenses = $3,750 (coach salary) + $2,500 (real estate) + $1,000 (life skills) + $1,250 (misc) + $3,000 (timeback)
Total Operating Expenses = Students × $11,500 × Cost Inflation Factor
Marketing = New Students × ($500 ToF + $2,500 BoF)
Total Expenses = Operating Expenses + Marketing
```

**Mid-Sized Schools**:
```
Per-Student Operating Cost = $12,000 × Cost Inflation Factor
Marketing = New Students × ($1,000 ToF + $4,000 BoF)
Total Expenses = (Students × $12,000 × Cost Inflation) + Marketing
```

**Flagship Campuses**:
```
Per-Student Operating Cost = $15,000 × Cost Inflation Factor
Marketing = New Students × ($2,000 ToF + $8,000 BoF)
Total Expenses = (Students × $15,000 × Cost Inflation) + Marketing
```

#### EBITDA Calculation

```
Tier EBITDA = Tier Revenue - Tier Operating Expenses - Tier Marketing
Total EBITDA = Sum of all Tier EBITDAs
EBITDA Margin = Total EBITDA / Total Revenue
```

#### Capital Expenditures (CapEx)

**Mid-Sized Schools**:
```
Renovated Model: $1M (purchase) + $14M (renovation) = $15M per school
Ground-Up Model: $10M (purchase) + $40M (construction) = $50M per school
Blended Average = ($15M × 50%) + ($50M × 50%) = $32.5M per school
Annual CapEx = New Schools × $32.5M
```

**Flagship Campuses**:
```
CapEx per Campus = $75M to $150M (adjustable parameter)
Annual CapEx = New Campuses × CapEx per Campus
```

### Advanced Analytics Methodology

#### Monte Carlo Simulation

The Monte Carlo simulation runs 500 iterations to generate a probability distribution of potential outcomes. Each iteration:

1. **Randomizes Key Parameters**:
   - Virtual Growth: Base × (0.8 to 1.2) random factor
   - Micro Growth: Base × (0.7 to 1.3) random factor
   - Mid-Sized Growth: Base × (0.6 to 1.4) random factor
   - Cost Inflation: Base × (0.9 to 1.1) random factor
   - EBITDA Multiple: Base × (0.7 to 1.3) random factor

2. **Runs Complete Model**: Calculates all 10 years with randomized parameters

3. **Captures Outcomes**:
   - Terminal Value
   - Year 10 Revenue
   - Year 10 EBITDA
   - Peak Funding Requirement

4. **Sorts Results**: Orders all iterations by terminal value

5. **Calculates Percentiles**:
   - P10 (10th percentile): Pessimistic outcome
   - P25 (25th percentile): Below average
   - P50 (50th percentile): Median/expected
   - P75 (75th percentile): Above average
   - P90 (90th percentile): Optimistic outcome

**Interpreting Results**:
- 80% confidence interval: P10 to P90 range
- 50% confidence interval: P25 to P75 range
- Median (P50) represents most likely outcome
- Wider ranges indicate higher uncertainty

#### Sensitivity Analysis

Tests how terminal value changes with specific parameter variations:

**Growth Sensitivity**:
- Varies mid-sized school growth from 50% to 150% of base
- Tests impact of primary revenue driver
- Shows linear or non-linear relationship

**Valuation Multiple Sensitivity**:
- Varies EBITDA multiple from 50% to 150% of base
- Tests market valuation assumptions
- Critical for exit planning and fundraising

#### Cash Flow Calculation

```
Net Cash Flow = Total EBITDA - Total CapEx
Cumulative Cash Flow = Sum of Net Cash Flow from Year 1 to Current Year
Peak Funding Need = Minimum Cumulative Cash Flow (most negative point)
Breakeven Year = First year where Cumulative Cash Flow > 0
```

#### Terminal Value Calculation

```
Terminal Value = (Year 10 EBITDA × EBITDA Multiple) + (Cumulative CapEx × 80%)

Where:
- EBITDA Multiple ranges from 12x (conservative) to 22x (aggressive)
- 80% of CapEx represents property value retention
```

### Timeback Mechanism

**What is Timeback?**
Timeback is a core component of the TSA model where a portion of tuition revenue is returned to families, reducing their effective cost of education. This represents TSA's commitment to making education more affordable and accessible.

**How Timeback Works**:
- Calculated as a fixed dollar amount per student
- Included in operating expenses but also tracked separately
- Reduces net revenue but improves value proposition
- Target: Maintain ~20% of gross revenue as timeback

**Timeback by Tier**:
- Virtual: $2,000 per student (19.1% of $10,474 tuition)
- Microschools: $3,000 per student (20% of $15,000 tuition)
- Mid-Sized: $5,000 per student (20% of $25,000 tuition)
- Flagship: $10,000 per student (20% of $50,000 tuition)

### Growth Trajectories

The model includes predefined growth paths for each tier based on market analysis and strategic planning:

**Virtual Schools** (Students):
- Year 1: 10,000 → Year 5: 50,000 → Year 10: 100,000
- Linear growth of 10,000 students per year initially, plateaus at 100K

**Microschools** (School Count):
- Year 1: 20 → Year 5: 1,620 → Year 6+: 4,000
- Exponential growth (3x per year) early on, then plateaus
- Represents viral franchise-style expansion

**Mid-Sized Schools** (School Count):
- Year 1: 2 → Year 5: 100 → Year 10: 800
- Accelerating growth as model proves successful
- Reflects increasing capital availability and operational expertise

**Flagship Campuses** (Campus Count):
- Year 1-3: 0 → Year 4: 1 → Year 10: 4
- Delayed start allows for brand establishment
- Limited number reflects high capital requirements and strategic positioning

### Scenario Presets

The model includes three preset scenarios that adjust multiple parameters simultaneously:

**Conservative Scenario**:
- Virtual Growth: 80% of base trajectory
- Micro Growth: 70% of base trajectory
- Mid-Sized Growth: 60% of base trajectory
- Flagship CapEx: $150M per campus
- Cost Inflation: 110% (higher costs)
- EBITDA Multiple: 12x (lower valuation)

**Base Case Scenario**:
- Virtual Growth: 100% of base trajectory
- Micro Growth: 100% of base trajectory
- Mid-Sized Growth: 100% of base trajectory
- Flagship CapEx: $75M per campus
- Cost Inflation: 100% (baseline costs)
- EBITDA Multiple: 17.5x (market average)

**Aggressive Scenario**:
- Virtual Growth: 120% of base trajectory
- Micro Growth: 130% of base trajectory
- Mid-Sized Growth: 120% of base trajectory
- Flagship CapEx: $60M per campus (economies of scale)
- Cost Inflation: 95% (operational efficiencies)
- EBITDA Multiple: 22x (premium valuation)

## Detailed Model Assumptions

### Virtual Schools

**Business Model**: Online education platform providing K-12 curriculum with virtual teachers and support

**Key Assumptions**:
- **Tuition**: $10,474/year
  - Positioned below traditional private schools but above public school costs
  - Reflects lower overhead from virtual delivery
  
- **Timeback**: $2,000/student (19.1% of tuition)
  - Reduces effective tuition to ~$8,474 for families
  - Competitive advantage in online education market
  
- **Operating Expenses**: $6,750/student
  - $3,000: Headcount (teachers, support staff, technology)
  - $1,000: Programs (curriculum, software licenses, content)
  - $750: Miscellaneous (admin, overhead, customer service)
  - $2,000: Timeback (returned to families)
  
- **Marketing Costs**:
  - $500 ToF (Top of Funnel): Awareness campaigns, digital ads
  - $2,000 BoF (Bottom of Funnel): Conversion efforts, enrollment support
  - Total: $2,500 per new student acquisition
  
- **Student Lifecycle**: 2.5 years average enrollment
- **Churn Rate**: 7.5% organic annual churn
- **Growth**: Linear path to 100,000 students by Year 10
- **Unit Economics**: ~$1,224 contribution margin per student before marketing

### Microschools

**Business Model**: Small, community-based schools serving 25 students with personalized learning and local coaches

**Key Assumptions**:
- **Tuition**: $15,000/year
  - Premium to virtual but below traditional private schools
  - Reflects personalized attention and community setting
  
- **Timeback**: $3,000/student (20% of tuition)
  - Effective tuition: $12,000 for families
  
- **Capacity**: 25 students per school
  - Optimal size for personalized learning
  - Manageable for single coach/facilitator model
  
- **Operating Expenses**: $11,500/student
  - $3,750: Coach salary (allocated per student)
  - $2,500: Real estate (rent, utilities, facilities)
  - $1,000: Life skills programs and enrichment
  - $1,250: Miscellaneous (supplies, admin, technology)
  - $3,000: Timeback to families
  
- **Fill Rates**:
  - Year 1 (new school): 70% (17-18 students)
  - Year 2+: 100% (25 students)
  - Reflects ramp-up period for new locations
  
- **Marketing**:
  - $500 ToF per new student
  - $2,500 BoF per new student
  - Total: $3,000 per student acquisition
  
- **Growth**: Exponential expansion (3x annually) to 4,000 schools
- **Economics**: Positive unit economics after Year 2 in each location

### Mid-Sized Schools (Strata Achievement Centers)

**Business Model**: Traditional school campuses serving 400-1,000 students with comprehensive facilities

**Key Assumptions**:
- **Tuition**: $25,000/year
  - Competitive with quality private schools
  - Justifiable by facilities and comprehensive programs
  
- **Timeback**: $5,000/student (20% of tuition)
  - Effective tuition: $20,000 for families
  
- **Two Development Models**:
  1. **Renovated Buildings**:
     - Capacity: 400 students
     - Purchase: $1M
     - Renovation CapEx: $14M
     - Total: $15M investment
     - $37,500 per student capacity
     
  2. **Ground-Up Construction**:
     - Capacity: 1,000 students
     - Land Purchase: $10M
     - Construction CapEx: $40M
     - Total: $50M investment
     - $50,000 per student capacity
     
- **Blended Approach**: 50/50 mix of renovated and ground-up
  - Average capacity: 700 students per school
  - Average investment: $32.5M per school
  
- **Fill Rate Progression**:
  - Year 1: 0% (construction/renovation)
  - Year 2: 33% (~230 students)
  - Year 3: 67% (~470 students)
  - Year 4+: 100% (700 students)
  
- **Operating Expenses**: $12,000/student
  - Includes facilities, teachers, admin, programs
  - Scales with enrollment
  
- **Marketing**:
  - $1,000 ToF per new student
  - $4,000 BoF per new student
  - Total: $5,000 per student (reflects higher-value offering)
  
- **Growth**: 2 schools (Year 1) → 800 schools (Year 10)
- **Economics**: Capital intensive but strong margins at scale

### Flagship Campuses

**Business Model**: Premium, large-scale campuses serving 1,500 students with world-class facilities and programs

**Key Assumptions**:
- **Tuition**: $50,000/year
  - Premium positioning comparable to elite boarding schools
  - Justified by exceptional facilities and programming
  
- **Timeback**: $10,000/student (20% of tuition)
  - Effective tuition: $40,000 for families
  - Maintains affordability commitment even at premium tier
  
- **Capacity**: 1,500 students per campus
  - Large enough for diverse programs and economies of scale
  - Small enough to maintain community and culture
  
- **Capital Expenditure**: $75M-$150M per campus
  - Adjustable based on location and scope
  - Includes land, construction, and initial FF&E
  - World-class facilities (labs, arts, athletics, etc.)
  
- **Fill Rate Progression**:
  - Years 1-2: 0% (construction period)
  - Year 3: 33% (~500 students)
  - Year 4: 67% (~1,000 students)
  - Year 5+: 100% (1,500 students)
  - Longer ramp reflects larger scale and brand building
  
- **Operating Expenses**: $15,000/student
  - Premium staffing, programs, and facilities maintenance
  
- **Marketing**:
  - $2,000 ToF per new student
  - $8,000 BoF per new student
  - Total: $10,000 per student (reflects premium positioning)
  
- **Growth**: 0 campuses (Years 1-3) → 4 campuses (Year 10)
  - Delayed launch allows for brand establishment
  - Limited number ensures exclusivity and capital efficiency
  
- **Economics**: Highest per-student revenue and margins at maturity

### Cross-Tier Assumptions

**Cost Inflation**:
- Base case: 100% (no inflation)
- Adjustable: 80% to 130%
- Applies uniformly to all operating expenses
- Does not affect tuition (assumed pricing power maintains rates)

**Marketing Efficiency**:
- ToF (Top of Funnel): Awareness and lead generation
- BoF (Bottom of Funnel): Conversion and enrollment
- Costs only apply to net new students
- Existing students renew without additional marketing cost

**EBITDA Multiple for Valuation**:
- Conservative: 12x (recession scenario, lower education valuations)
- Base Case: 17.5x (market average for education businesses)
- Aggressive: 22x (premium for growth and mission-driven model)

**Property Value Retention**:
- 80% of cumulative CapEx assumed to retain value
- Reflects real estate appreciation and facility value
- Added to EBITDA-based valuation for terminal value

**Timeline**:
- SY26 (School Year 2026) = Year 1
- SY36 (School Year 2036) = Year 10 (terminal year)
- 11 years of projections total (includes Year 0/starting point)

### Model Limitations and Considerations

**What the Model Does NOT Account For**:
1. **Interest Expense**: Assumes equity funding; does not model debt service
2. **Taxes**: EBITDA is pre-tax; actual tax burden not calculated
3. **Working Capital**: Cash flow timing and receivables/payables not modeled
4. **Regulatory Changes**: Assumes stable regulatory environment
5. **Macroeconomic Factors**: No recession, inflation beyond cost assumptions
6. **Competition**: Assumes market share capture as planned
7. **Execution Risk**: Assumes operational targets are met
8. **Detailed P&L**: Simplified expense categories vs. full accounting detail

**Key Risks and Sensitivities**:
- **Growth Trajectory Risk**: Actual enrollment may differ from projections
- **Capital Availability**: Funding for expansion may be constrained
- **Fill Rate Achievement**: New schools may take longer to reach capacity
- **Cost Inflation**: Actual cost increases may exceed assumptions
- **Valuation Multiple**: Exit multiples are market-dependent and variable
- **Competitive Dynamics**: Other education providers may impact pricing/share

**Best Practices for Use**:
1. **Run Multiple Scenarios**: Test conservative, base, and aggressive cases
2. **Use Monte Carlo**: Understand probability ranges, not just point estimates
3. **Stress Test**: Try extreme parameters to understand break points
4. **Compare to Actual**: Update assumptions quarterly based on real performance
5. **Focus on Trends**: Directional insights often more valuable than exact numbers
6. **Validate Assumptions**: Cross-check against market data and benchmarks

### Key Insights from the Model

**What Drives Value**:
1. **Mid-Sized Schools**: Contribute ~76% of Year 10 revenue in base case
2. **Scale Matters**: EBITDA margins improve from -95% (Year 1) to 20% (Year 10)
3. **Capital Intensity**: Requires ~$15.6B cumulative CapEx over 10 years
4. **J-Curve Profile**: Heavy losses early (peak -$5.3B), strong cash generation later
5. **Terminal Value Sensitivity**: Most sensitive to EBITDA multiple and mid-sized growth

**Strategic Implications**:
- Early funding needs are substantial but manageable with staged capital raises
- Microschools provide fastest path to revenue but mid-sized drives scale
- Flagship campuses are strategic brand builders, not primary revenue drivers
- Breakeven typically achieved in Years 5-6 under base assumptions
- Terminal values of $25B-$65B justify significant upfront investment

**Scenario Comparison** (Terminal Value):
- Conservative: $24.5B (slower growth, higher costs, lower multiple)
- Base Case: $39.7B (planned execution)
- Aggressive: $88.3B (faster growth, efficiencies, premium valuation)
- Range suggests 10-year IRR potential of 40-80%+ on invested capital

## Technical Details

### Built With
- **React 18**: UI framework
- **Recharts**: Data visualization library
- **Tailwind CSS**: Styling framework
- **Lucide Icons**: Icon library
- **Vanilla JavaScript**: Financial calculations

### Browser Compatibility
- Chrome/Edge (recommended): Latest versions
- Firefox: Latest versions
- Safari: Latest versions
- Mobile browsers: Responsive design works on tablets and large phones

### File Structure
```
tsa_model/
├── index.html              # Main application file (fully self-contained)
├── tsa-scenario-model.jsx  # Original React component source
├── TSA Model (3).xlsx      # Original Excel model reference
└── README.md               # This file
```

## Customization

The model parameters can be adjusted in two ways:

1. **Through the UI**: Use the sliders in the "Custom Parameters" section
2. **In the Code**: Edit the `BASE_ASSUMPTIONS` and `BASE_TRAJECTORIES` objects in `index.html`

### Modifying Base Assumptions
To change underlying model assumptions, edit the `BASE_ASSUMPTIONS` object around line 38 of `index.html`:

```javascript
const BASE_ASSUMPTIONS = {
  virtual: {
    tuition: 10474,      // Adjust tuition price
    timeback: 2000,      // Adjust timeback amount
    // ... other parameters
  },
  // ... other tiers
};
```

### Modifying Growth Trajectories
To change the school/student growth paths, edit the `BASE_TRAJECTORIES` object around line 88:

```javascript
const BASE_TRAJECTORIES = {
  virtual: [10000, 20000, 30000, ...],     // Student counts by year
  microSchools: [20, 60, 180, ...],        // School counts by year
  // ... other tiers
};
```

## Future Enhancements

Potential additions to consider:
- [ ] LLM integration for Q&A about the model (using OpenAI API or similar)
- [ ] Export functionality (PDF reports, CSV data)
- [ ] Comparison mode (side-by-side scenario comparison)
- [ ] Historical data tracking (save and compare previous runs)
- [ ] Additional school tiers or business models
- [ ] Detailed expense breakdowns
- [ ] Fundraising milestone integration

## FAQ

**Q: What if I see "Error Loading Application - Required libraries failed to load: Recharts"?**
A: This has been fixed with automatic CDN fallback. If you still experience issues:
- Try refreshing the page (Ctrl+Shift+R or Cmd+Shift+R)
- Disable browser extensions (especially ad blockers)
- Try a different browser (Chrome recommended)
- Check your internet connection
- See `CDN_FALLBACK.md` for detailed troubleshooting

**Q: Can I use this offline?**
A: After the first load, the application caches all CDN resources, so it will work offline.

**Q: Can I share my custom scenario?**
A: The current version doesn't save scenarios, but you can note down the parameter values and recreate them.

**Q: How accurate is the Monte Carlo simulation?**
A: It uses randomized variations (±20-40%) on key parameters over 500 iterations to show probability distributions.

**Q: Can I change the 10-year time horizon?**
A: Yes, but it requires editing the code. Modify the `YEARS` array and trajectory arrays to match your desired timeline.

**Q: What does "Timeback" mean?**
A: Timeback refers to financial benefits returned to families, reducing the effective tuition cost.

## Support

For questions or issues:
1. Review the baked-in assumptions section at the bottom of the webpage
2. Check the original Excel model (`TSA Model (3).xlsx`) for reference
3. Review the source code in `index.html` for calculation logic
4. For CDN/loading issues, see `CDN_FALLBACK.md`

## License

This model is provided as-is for financial planning and analysis purposes.

---

**Version**: 1.1  
**Last Updated**: January 2026  
**Based on**: TSA Financial Model (December 2024 assumptions)

**Recent Updates**:
- Fixed Recharts CDN loading issues with automatic fallback mechanism
- Downgraded to Recharts 2.1.16 for better stability
- Added comprehensive error handling and user guidance
