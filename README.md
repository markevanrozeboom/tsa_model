# TSA Financial Scenario Model - Interactive Web Application

An interactive static webpage for dynamically modeling financial scenarios for TSA (The Strata Academy). This tool allows you to isolate different components of the business and adjust various inputs to see real-time impacts on financial projections over a 10-year period.

## Live Demo

**Access the live application**: [https://markevanrozeboom.github.io/tsa_model/](https://markevanrozeboom.github.io/tsa_model/)

The application is hosted on GitHub Pages and is fully functional directly in your browser - no installation required!

## Features

### Scenario Analysis
- **Three Pre-built Scenarios**: Conservative, Base Case, and Aggressive growth scenarios
- **Custom Parameters**: Adjust growth rates, capital expenditures, and cost assumptions
- **Real-time Updates**: All charts and metrics update instantly as you adjust parameters

### Comprehensive Visualizations
- **Student Enrollment**: Stacked area chart showing growth across all four tiers
- **Revenue Breakdown**: Interactive charts showing revenue composition by school type
- **Cash Flow Analysis**: Waterfall charts with EBITDA, CapEx, and cumulative cash flow
- **Margin Progression**: Track EBITDA margins and Timeback percentages over time
- **Revenue Mix**: Pie chart showing final year revenue distribution

### Advanced Analytics
- **Monte Carlo Simulation**: Run 500 iterations to see probability distributions of outcomes
- **Sensitivity Analysis**: Visualize how terminal value responds to changes in key variables
- **Breakeven Analysis**: Identify when the business becomes cash flow positive
- **Goal Seek / Solver**: Find the required growth rate to hit any target metric
- **Unit Economics**: Detailed per-student P&L breakdown with CAC/LTV analysis
- **Value Waterfall**: Visual breakdown of terminal value by component

### Data Export
- **Data Tables**: View all projections in sortable tabular format
- **CSV Export**: Download data for use in Excel or other tools

### Four Business Tiers Modeled
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
3. All dependencies are vendored locally for reliability

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
   - **Unit Economics**: Per-student P&L and CAC/LTV analysis
   - **Goal Seek**: Find required inputs for target outcomes
   - **Sensitivity**: Run Monte Carlo simulations and sensitivity analyses
   - **Data Tables**: Sortable tables with CSV export

### Key Metrics Explained
- **Year 10 Students**: Total student enrollment in the final year
- **Year 10 Revenue**: Total annual revenue in the final year
- **Year 10 EBITDA**: Earnings before interest, taxes, depreciation, and amortization
- **Terminal Value**: Estimated business value at end of 10-year period (EBITDA multiple + property value)
- **Peak Funding Need**: Maximum capital required before reaching cash flow positive

## Detailed Model Assumptions

### Virtual Schools

**Business Model**: Online education platform providing K-12 curriculum with virtual teachers and support

| Metric | Value |
|--------|-------|
| Tuition | $10,474/year |
| Timeback | $2,000/student (19.1%) |
| Headcount | $3,000/student |
| Programs | $1,000/student |
| Misc | $750/student |
| **Total Expenses** | **$6,750/student** |
| Marketing (ToF + BoF) | $2,500/new student |
| Avg Student Life | 2.5 years |
| Organic Churn | 7.5% |

### Microschools

**Business Model**: Small, community-based schools serving 25 students with personalized learning

| Metric | Value |
|--------|-------|
| Tuition | $15,000/year |
| Timeback | $3,000/student (20%) |
| Coach Salary | $3,750/student |
| Real Estate | $2,500/student |
| Life Skills | $1,000/student |
| Misc | $1,250/student |
| **Total Expenses** | **$11,500/student** |
| Marketing (ToF + BoF) | $3,000/new student |
| Students per School | 25 |
| Fill Rate Year 1 | 70% |
| Fill Rate Year 2+ | 100% |

### Mid-Sized Schools (Strata Achievement Centers)

**Business Model**: Traditional school campuses serving 400-1,000 students with comprehensive facilities

| Metric | Value |
|--------|-------|
| Tuition | $25,000/year |
| Timeback | $5,000/student (20%) |
| Headcount | $5,773/student |
| Programs/Motivation | $2,500/student |
| Misc Expenses | $1,250/student |
| **Other Facilities** | **$3,000/student** |
| **Total Expenses** | **$17,523/student** |
| **Pre-Facilities Margin** | **29.9%** |
| Marketing (ToF + BoF) | $5,000/new student |

**Capital Expenditure**:
- Renovated Model: $1M purchase + $14M renovation = $15M per school (400 students)
- Ground-Up Model: $10M land + $40M construction = $50M per school (1,000 students)
- Blended Average (50/50): $32.5M per school, 700 students capacity

**Fill Rate Progression**: 0% (Year 1) → 33% (Year 2) → 67% (Year 3) → 100% (Year 4+)

### Flagship Campuses

**Business Model**: Premium, large-scale campuses serving 1,500 students with world-class facilities

| Metric | Value |
|--------|-------|
| Tuition | $50,000/year |
| Timeback | $10,000/student (20%) |
| Headcount | $5,244/student |
| Programs/Motivation | $2,500/student |
| Misc Expenses | $1,250/student |
| **Other Facilities** | **$5,000/student** |
| **Total Expenses** | **$23,994/student** |
| **Pre-Facilities Margin** | **52.0%** |
| Marketing (ToF + BoF) | $10,000/new student |
| Students per Campus | 1,500 |
| CapEx per Campus | $75M - $150M (adjustable) |

**Fill Rate Progression**: 0% (Years 1-2) → 33% (Year 3) → 67% (Year 4) → 100% (Year 5+)

### Growth Trajectories

| Year | Virtual Students | Microschools | Mid-Sized Schools | Flagship Campuses |
|------|------------------|--------------|-------------------|-------------------|
| SY26 | 10,000 | 20 | 2 | 0 |
| SY27 | 20,000 | 60 | 10 | 0 |
| SY28 | 30,000 | 180 | 20 | 0 |
| SY29 | 40,000 | 540 | 50 | 1 |
| SY30 | 50,000 | 1,620 | 100 | 1 |
| SY31 | 60,000 | 4,000 | 150 | 2 |
| SY32 | 70,000 | 4,000 | 200 | 2 |
| SY33 | 80,000 | 4,000 | 250 | 3 |
| SY34 | 90,000 | 4,000 | 400 | 3 |
| SY35 | 100,000 | 4,000 | 625 | 4 |
| SY36 | 100,000 | 4,000 | 800 | 4 |

### Scenario Presets

| Parameter | Conservative | Base Case | Aggressive |
|-----------|-------------|-----------|------------|
| Virtual Growth | 80% | 100% | 120% |
| Micro Growth | 70% | 100% | 130% |
| Mid-Sized Growth | 60% | 100% | 120% |
| Flagship CapEx | $150M | $75M | $60M |
| Cost Inflation | 110% | 100% | 95% |
| EBITDA Multiple | 12x | 17.5x | 22x |

## Timeback Mechanism

Timeback is a core component of the TSA model where a portion of tuition revenue is returned to families, reducing their effective cost of education.

| Tier | Timeback Amount | % of Tuition |
|------|-----------------|--------------|
| Virtual | $2,000 | 19.1% |
| Microschools | $3,000 | 20.0% |
| Mid-Sized | $5,000 | 20.0% |
| Flagship | $10,000 | 20.0% |

## Terminal Value Calculation

```
Terminal Value = (Year 10 EBITDA × EBITDA Multiple) + Property Value

Where:
- Property Value = (Mid-Sized Schools × $30M) + (Flagship Campuses × $100M)
- EBITDA Multiple ranges from 12x (conservative) to 22x (aggressive)
```

## Technical Details

### Built With
- **React 18**: UI framework
- **Recharts**: Data visualization library
- **Tailwind CSS**: Styling framework
- **Lucide Icons**: Icon library
- **Babel**: JSX compilation (build time only)

### File Structure
```
tsa_model/
├── index.html              # Main application entry point
├── vendor/                 # Vendored dependencies (React, Recharts, etc.)
├── src/app.jsx            # Source JSX (edit this for changes)
├── TSA Model.xlsx         # Reference Excel model
└── README.md              # This file
```

### Making Changes

1. Edit `src/app.jsx` with your changes
2. Compile: `npx babel --presets @babel/preset-react src/app.jsx -o vendor/app.js`
3. Test locally by opening `index.html`
4. Commit and push to deploy

## FAQ

**Q: What if I see "Error Loading Application"?**
A: Try a hard refresh (Ctrl+Shift+R). All dependencies are vendored locally, so CDN issues should not occur.

**Q: Can I use this offline?**
A: Yes! All dependencies are included in the vendor folder.

**Q: How do I find the required growth rate for a specific target?**
A: Use the Goal Seek tab. Set your target metric and value, choose which parameter to adjust, and click Calculate.

**Q: Can I export the data?**
A: Yes, go to the Data Tables tab and click "Export CSV".

**Q: What does "Other Facilities" mean in expenses?**
A: This covers additional facility-related costs for Mid-Sized and Flagship schools including maintenance, utilities, and operational facility expenses beyond the base real estate costs.

## Version History

**Version 2.0** (January 2026)
- Added Goal Seek / Solver feature
- Added Unit Economics panel with CAC/LTV analysis
- Added Data Tables with sorting and CSV export
- Added Value Creation Waterfall visualization
- Updated Mid-Sized Schools expenses: Added Other Facilities ($3,000/student)
- Updated Flagship Schools expenses: Added Other Facilities ($5,000/student)
- Vendored all dependencies locally (no CDN dependency)
- Pre-compiled JSX for faster loading

**Version 1.1** (January 2026)
- Fixed Recharts CDN loading issues
- Added CDN fallback mechanism

**Version 1.0** (December 2025)
- Initial release

---

**Last Updated**: January 2026
**Based on**: TSA Model.xlsx (January 2026)
