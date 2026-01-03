# Quick Start Guide

## 🚀 Get Started in 30 Seconds

1. **Open the tool**: Double-click `index.html` in your browser
2. **Pick a scenario**: Click Conservative, Base Case, or Aggressive
3. **Explore the data**: Click through the Overview, Revenue, Cash Flow, and Sensitivity tabs

That's it! You're now modeling TSA's 10-year financial projections.

## 🎯 Common Tasks

### Change Growth Assumptions
1. Click "Custom Parameters" button
2. Drag the sliders to adjust:
   - Virtual school growth
   - Microschool growth  
   - Mid-sized school growth
3. Watch the numbers update in real-time

### Run Monte Carlo Simulation
1. Open "Custom Parameters"
2. Click "Run Monte Carlo (500 sims)"
3. Switch to "Sensitivity" tab to see results
4. View probability distribution (P10 to P90)

### View Detailed Revenue
1. Click "Revenue" tab
2. See stacked area chart showing all four tiers
3. Scroll down for year-by-year breakdown table

### Understand Cash Flow
1. Click "Cash Flow" tab
2. Green bars = EBITDA (earnings)
3. Red bars = CapEx (capital spending)
4. Black line = Cumulative cash flow
5. Check the three summary cards below

## 📊 What You're Looking At

### Four School Tiers
- **Virtual**: Online schools (100K students target)
- **Micro**: Small community schools (4,000 schools target)
- **Mid-Sized**: 400-1000 student campuses
- **Flagship**: Premium 1,500 student campuses

### Key Metrics (Top Cards)
- **Year 10 Students**: Total enrollment in final year
- **Year 10 Revenue**: Total annual revenue in SY36
- **Year 10 EBITDA**: Operating profit in final year
- **Terminal Value**: Estimated business value at year 10
- **Peak Funding**: Maximum capital needed before breakeven

### Scenarios Explained
- **Conservative**: Slower growth (60-80%), higher costs
- **Base Case**: Current plan (100% of projections)
- **Aggressive**: Faster growth (120-130%), lower costs

## 🎓 Tips

- Hover over charts to see exact values
- All dollar amounts are in USD
- "M" = Million, "B" = Billion, "K" = Thousand
- The model assumes a 10-year horizon (SY26-SY36)
- Timeback = money returned to families (reduces net tuition)

## 📖 Need More Help?

- **Full documentation**: See README.md
- **Testing guide**: See TESTING.md  
- **Add AI chat**: See LLM_INTEGRATION.md
- **Model details**: Click "Baked-In Assumptions" at the bottom of the page

## ⚡ Pro Tips

1. **Compare scenarios**: Switch between them to see differences
2. **Extreme testing**: Try setting all growth to minimum or maximum
3. **Focus on margins**: Watch EBITDA margin in the Overview tab
4. **Check breakeven**: Look at "Peak Funding Need" card
5. **Save screenshots**: Use browser screenshot tools to capture scenarios

## 🔧 Troubleshooting

**Page is blank?**
- Make sure you have internet connection (first load only)
- Try refreshing the page
- Try a different browser (Chrome recommended)

**Charts not showing?**
- Wait a few seconds for libraries to load
- Check that JavaScript is enabled
- Clear browser cache and reload

**Numbers seem wrong?**
- Check which scenario is selected
- Verify slider positions in Custom Parameters
- Click "Base Case" to reset to defaults

---

**Ready to dive deeper?** Open README.md for complete documentation.

**Want to customize the model?** Edit the assumptions in index.html (search for `BASE_ASSUMPTIONS`).

**Need help?** All model calculations are transparent in the source code.
