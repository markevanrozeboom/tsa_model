# TSA Financial Scenario Model - Interactive Web Application

An interactive static webpage for dynamically modeling financial scenarios for TSA (The Strata Academy). This tool allows you to isolate different components of the business and adjust various inputs to see real-time impacts on financial projections over a 10-year period.

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

### Quick Start
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

## Model Assumptions

### Virtual Schools
- Tuition: $10,474/year
- Timeback to families: $2,000 (19.1%)
- Operating expenses: $6,750 per student
- Marketing: $500 ToF + $2,000 BoF per new student

### Microschools
- Tuition: $15,000/year
- Timeback: $3,000 (20%)
- Capacity: 25 students per school
- Fill Rate: 70% Year 1, 100% Year 2
- Marketing: $500 ToF + $2,500 BoF per new student

### Mid-Sized Schools (SAC)
- Tuition: $25,000/year
- Timeback: $5,000 (20%)
- Two models:
  - Renovated: 400 students, $15M CapEx
  - Ground-up: 1,000 students, $50M CapEx
- 50/50 blend of the two models
- Fill progression: 0% → 33% → 67% → 100% over 3 years

### Flagship Campuses
- Tuition: $50,000/year
- Timeback: $10,000 (20%)
- Capacity: 1,500 students per campus
- Target: 4 campuses
- Fill progression: 0% → 0% → 33% → 67% → 100% over 4 years
- CapEx: $75M-$150M per campus (adjustable)

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

## License

This model is provided as-is for financial planning and analysis purposes.

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Based on**: TSA Financial Model (December 2024 assumptions)
