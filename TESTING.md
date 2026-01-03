# TSA Model Testing Instructions

## Quick Test in Browser

1. **Open the file**:
   - Navigate to the repository folder
   - Double-click `index.html` or right-click and select "Open with" your preferred browser
   - OR drag and drop `index.html` into an open browser window

2. **Expected Results**:
   - Page loads with title "TSA / Strata Financial Model"
   - Three scenario buttons visible: Conservative, Base Case, Aggressive
   - Five metric cards showing Year 10 Students, Revenue, EBITDA, Terminal Value, Peak Funding
   - Four tabs: Overview, Revenue, Cash Flow, Sensitivity
   - Charts should render (may take a few seconds on first load)

## Feature Testing Checklist

### Basic Functionality
- [ ] Page loads without errors
- [ ] All charts render correctly
- [ ] Scenario buttons are clickable and change the data
- [ ] "Custom Parameters" expands to show sliders
- [ ] Sliders update metrics in real-time

### Scenario Testing
1. **Conservative Scenario**:
   - [ ] Click "Conservative" button
   - [ ] Verify lower growth rates (80%, 70%, 60%)
   - [ ] Check that metrics are lower than Base Case

2. **Base Case Scenario** (default):
   - [ ] Click "Base Case" button
   - [ ] All growth rates should be 100%
   - [ ] Terminal Value should be in billions

3. **Aggressive Scenario**:
   - [ ] Click "Aggressive" button
   - [ ] Verify higher growth rates (120%, 130%, 120%)
   - [ ] Check that metrics are higher than Base Case

### Interactive Parameters
1. **Open Custom Parameters**:
   - [ ] Click "Custom Parameters" button
   - [ ] Six sliders should appear in three columns

2. **Test Each Slider**:
   - [ ] Virtual Schools Growth (50% - 150%)
   - [ ] Microschools Growth (50% - 150%)
   - [ ] Mid-Sized Growth (30% - 150%)
   - [ ] Flagship CapEx ($50M - $200M)
   - [ ] Cost Inflation (80% - 130%)
   - [ ] EBITDA Multiple (8x - 25x)

3. **Verify Real-time Updates**:
   - [ ] Move any slider
   - [ ] Metric cards update immediately
   - [ ] Charts redraw with new data

### Tab Navigation
1. **Overview Tab** (default):
   - [ ] Student Enrollment stacked area chart
   - [ ] Year 10 Revenue Mix pie chart
   - [ ] Margin Progression line chart

2. **Revenue Tab**:
   - [ ] Revenue by Tier area chart
   - [ ] Revenue table with all 11 years
   - [ ] Totals column shows sum of all tiers

3. **Cash Flow Tab**:
   - [ ] Cash Flow Waterfall chart (bars + line)
   - [ ] Three summary cards: Cumulative CapEx, Peak Funding, Breakeven Year
   - [ ] Negative CapEx bars shown in red

4. **Sensitivity Tab**:
   - [ ] Two line charts: Growth sensitivity and Multiple sensitivity
   - [ ] "Run Monte Carlo" button
   - [ ] Click button and wait for results
   - [ ] Five percentile cards (P10, P25, P50, P75, P90)
   - [ ] Distribution bar chart

### Advanced Features
1. **Monte Carlo Simulation**:
   - [ ] Open Custom Parameters
   - [ ] Click "Run Monte Carlo (500 sims)"
   - [ ] Button shows "Running..." briefly
   - [ ] Results appear with 5 probability levels
   - [ ] Bar chart shows distribution

2. **Baked Assumptions**:
   - [ ] Scroll to bottom
   - [ ] Click "Baked-In Assumptions (Reference)"
   - [ ] Four columns expand showing all tier assumptions
   - [ ] Click again to collapse

### Browser Compatibility
Test on multiple browsers:
- [ ] Chrome/Chromium (recommended)
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browser (responsive design)

### Performance Testing
- [ ] Page loads in under 5 seconds
- [ ] Charts render smoothly
- [ ] Slider interactions feel responsive
- [ ] Monte Carlo completes in under 1 second
- [ ] No console errors (press F12 to check)

## Troubleshooting

### Page is Blank
- **Check**: Console for JavaScript errors (F12)
- **Solution**: Ensure you have internet connection for CDN resources (first load only)
- **Note**: After first load, page works offline

### Charts Not Rendering
- **Check**: Browser console for Recharts errors
- **Solution**: Refresh the page (Ctrl+R or Cmd+R)
- **Note**: Some browsers may block CDN resources; try Chrome

### Sliders Don't Update Charts
- **Check**: Console for React errors
- **Solution**: Clear browser cache and reload
- **Workaround**: Try a different browser

### Monte Carlo Button Does Nothing
- **Check**: Click "Sensitivity" tab first
- **Check**: Ensure "Custom Parameters" is expanded
- **Note**: Results appear in the Sensitivity tab

## Manual Validation

### Test Calculations
Verify a simple scenario manually:

1. Set all growth multipliers to 100%
2. Check Year 10 (SY36) Virtual Students:
   - Expected: 100,000 students
   - Revenue: 100,000 × $10,474 = ~$1.047B

3. Check Terminal Value formula:
   - Terminal Value = (Year 10 EBITDA × EBITDA Multiple) + (80% × Cumulative CapEx)
   - With 17.5x multiple, should be several billion dollars

### Edge Cases
1. **Minimum Values**:
   - [ ] Set all growth to minimum (30-50%)
   - [ ] Verify no NaN or Infinity values
   - [ ] Charts should still render

2. **Maximum Values**:
   - [ ] Set all growth to maximum (150%)
   - [ ] Verify large numbers format correctly (e.g., $2.5B not $2500000000)

3. **Zero Edge Case**:
   - [ ] Set mid-sized growth to 30%
   - [ ] Verify breakeven calculation still works

## Automated Checks

Run the validation script:
```bash
python3 << 'EOF'
import re
with open('index.html', 'r') as f:
    content = f.read()
checks = {
    'React': 'react@18' in content,
    'Recharts': 'recharts@2' in content,
    'Tailwind': 'tailwindcss' in content,
    'Component': 'TSAScenarioModel' in content,
}
for name, passed in checks.items():
    print(f"{'✓' if passed else '✗'} {name}")
EOF
```

## Success Criteria

The implementation is successful if:
1. ✓ Page loads in all major browsers
2. ✓ All charts render correctly
3. ✓ Interactive controls update data in real-time
4. ✓ Monte Carlo simulation runs without errors
5. ✓ Mobile responsive (works on tablets)
6. ✓ No console errors in browser dev tools
7. ✓ Calculations match expected values
8. ✓ Professional appearance and smooth UX

## Next Steps After Testing

If all tests pass:
1. Share the HTML file with stakeholders
2. Host on a web server for easy access (optional)
3. Consider adding LLM integration (see LLM_INTEGRATION.md)
4. Gather user feedback for improvements

If tests fail:
1. Check browser console for specific errors
2. Verify internet connection for CDN resources
3. Try a different browser
4. Review the README.md for troubleshooting tips
