# TSA Model - Sample Output Examples

This document shows example outputs from the TSA Financial Scenario Model to help you understand what to expect.

## Base Case Scenario - Key Metrics (Year 10 - SY36)

### Summary Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Year 10 Students    │  506K                                 │
│  Year 10 Revenue     │  $10.1B    (19.8% EBITDA margin)     │
│  Year 10 EBITDA      │  $2.0B                                │
│  Terminal Value      │  $39.7B    (17.5x EBITDA + Property) │
│  Peak Funding Need   │  $5.3B     (Breakeven: SY31)         │
└─────────────────────────────────────────────────────────────┘
```

## Student Enrollment Progression (Base Case)

| Year  | Virtual | Micro | Mid-Sized | Flagship | Total  |
|-------|---------|-------|-----------|----------|--------|
| SY26  | 10,000  | 500   | 0         | 0        | 10,500 |
| SY27  | 20,000  | 1,500 | 3,300     | 0        | 24,800 |
| SY28  | 30,000  | 4,500 | 9,950     | 0        | 44,450 |
| SY29  | 40,000  | 13,500| 22,450    | 495      | 76,445 |
| SY30  | 50,000  | 40,500| 43,500    | 990      | 134,990|
| SY31  | 60,000  | 100,000| 70,500   | 1,485    | 231,985|
| SY32  | 70,000  | 100,000| 99,750   | 1,980    | 271,730|
| SY33  | 80,000  | 100,000| 133,125  | 2,475    | 315,600|
| SY34  | 90,000  | 100,000| 195,500  | 2,970    | 388,470|
| SY35  | 100,000 | 100,000| 281,875  | 3,713    | 485,588|
| SY36  | 100,000 | 100,000| 356,000  | 4,950    | 560,950|

## Revenue by Tier (Base Case, $M)

| Year  | Virtual | Micro  | Mid-Sized | Flagship | Total   |
|-------|---------|--------|-----------|----------|---------|
| SY26  | $105M   | $7M    | $0M       | $0M      | $112M   |
| SY27  | $209M   | $23M   | $83M      | $0M      | $315M   |
| SY28  | $314M   | $68M   | $249M     | $0M      | $631M   |
| SY29  | $419M   | $203M  | $561M     | $25M     | $1.2B   |
| SY30  | $524M   | $608M  | $1,088M   | $50M     | $2.3B   |
| SY31  | $628M   | $1,500M| $1,763M   | $74M     | $4.0B   |
| SY32  | $733M   | $1,500M| $2,494M   | $99M     | $4.8B   |
| SY33  | $838M   | $1,500M| $3,328M   | $124M    | $5.8B   |
| SY34  | $942M   | $1,500M| $4,888M   | $149M    | $7.5B   |
| SY35  | $1,047M | $1,500M| $7,047M   | $186M    | $9.8B   |
| SY36  | $1,047M | $1,500M| $8,900M   | $248M    | $11.7B  |

## Cash Flow Analysis (Base Case)

### 10-Year Summary
- **Total Revenue (Cumulative)**: $48.1B
- **Total EBITDA (Cumulative)**: $10.2B
- **Total CapEx (Cumulative)**: $15.6B
- **Net Cumulative Cash Flow**: -$5.4B (initial investment recovered by terminal value)

### Peak Funding Requirement
- **When**: SY30 (Year 5)
- **Amount**: $5.3B
- **Breakeven Year**: SY31 (cumulative cash flow turns positive)

## Scenario Comparison - Terminal Value

| Metric              | Conservative | Base Case | Aggressive |
|---------------------|--------------|-----------|------------|
| Year 10 Students    | 337K         | 561K      | 706K       |
| Year 10 Revenue     | $6.4B        | $11.7B    | $15.2B     |
| Year 10 EBITDA      | $1.0B        | $2.3B     | $3.6B      |
| Terminal Value      | $24.5B       | $39.7B    | $88.3B     |
| EBITDA Multiple     | 12x          | 17.5x     | 22x        |
| Peak Funding        | $7.1B        | $5.3B     | $4.2B      |

## Monte Carlo Simulation Results (500 iterations)

Based on randomized variations in growth rates, costs, and valuation multiples:

```
Distribution of Terminal Value Outcomes:

P10 (Pessimistic):  $18.2B  ████████░░░░░░░░░░░░░░░░░░░░
P25:                $26.4B  ████████████░░░░░░░░░░░░░░░░
P50 (Median):       $39.1B  ████████████████████░░░░░░░░
P75:                $54.8B  ███████████████████████████░
P90 (Optimistic):   $68.5B  ██████████████████████████████

Range: $18.2B - $68.5B
Mean: $41.3B
Median: $39.1B
```

### Interpretation
- 50% chance terminal value is between $26.4B and $54.8B
- 80% chance terminal value is between $18.2B and $68.5B
- Median outcome very close to base case ($39.1B vs $39.7B)

## Sensitivity Analysis

### Terminal Value vs Mid-Sized School Growth
```
50% Growth:   $28.3B  ████████████████░░░░░░░░
75% Growth:   $34.0B  ████████████████████░░░░
100% Growth:  $39.7B  ████████████████████████
125% Growth:  $45.4B  ████████████████████████████
150% Growth:  $51.1B  ██████████████████████████████
```

### Terminal Value vs EBITDA Multiple
```
8x Multiple:   $22.8B  ████████████░░░░░░░░░░░░
12x Multiple:  $32.0B  ████████████████░░░░░░░░
17.5x Multiple:$39.7B  ████████████████████████
22x Multiple:  $54.9B  ██████████████████████████████
25x Multiple:  $62.3B  ████████████████████████████████
```

## Revenue Mix (Year 10 - SY36)

```
Virtual Schools:  9% (15% CAGR)
Microschools:     13% (116% CAGR)  
Mid-Sized:        76% (184% CAGR)
Flagship:         2% (∞ CAGR - starting from 0)
```

## Margin Progression

| Year  | EBITDA Margin | Timeback % |
|-------|---------------|------------|
| SY26  | -95.5%        | 18.8%      |
| SY27  | -50.2%        | 18.9%      |
| SY28  | -15.3%        | 19.2%      |
| SY29  | 4.3%          | 19.5%      |
| SY30  | 11.5%         | 19.6%      |
| SY31  | 15.2%         | 19.7%      |
| SY32  | 17.0%         | 19.8%      |
| SY33  | 18.0%         | 19.8%      |
| SY34  | 18.8%         | 19.8%      |
| SY35  | 19.3%         | 19.9%      |
| SY36  | 19.8%         | 19.9%      |

Target: 20% EBITDA margin by maturity ✓ (achieved by SY36)

## Key Insights from Base Case

1. **Scale Matters**: Mid-sized schools drive 76% of Year 10 revenue
2. **J-Curve Profile**: Heavy initial losses, turning profitable in Year 4
3. **Capital Intensive**: Requires $15.6B total CapEx over 10 years
4. **Strong Margins**: Reaches 19.8% EBITDA margin by Year 10
5. **Compelling Valuation**: $39.7B terminal value vs $5.3B peak funding
6. **Timeback Commitment**: Consistently returns ~20% to families

## Usage Examples

### Example 1: Test Lower Growth
**Question**: What if mid-sized schools grow 30% slower?
**Action**: Set Mid-Sized Growth slider to 70%
**Result**: Terminal Value drops from $39.7B to $34.0B (14% decrease)

### Example 2: Higher Valuation Multiple
**Question**: What if we achieve a 22x EBITDA multiple?
**Action**: Set EBITDA Multiple slider to 22x
**Result**: Terminal Value increases to $54.9B (38% increase)

### Example 3: Conservative + Slower Mid-Sized
**Question**: Worst case scenario?
**Action**: Select "Conservative" + set Mid-Sized to 50%
**Result**: Terminal Value ~$20B, but still positive ROI

---

*Note: These are illustrative examples based on the model's default assumptions. Actual results will vary based on execution and market conditions.*
