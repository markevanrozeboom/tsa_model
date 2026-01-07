const {
  useState,
  useMemo,
  useEffect,
  useRef
} = React;
const {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ReferenceLine
} = Recharts;

// Base assumptions (baked in)
const BASE_ASSUMPTIONS = {
  virtual: {
    tuition: 10474,
    timeback: 2000,
    headcount: 3000,
    programs: 1000,
    misc: 750,
    tofMarketing: 500,
    bofMarketing: 2000,
    avgStudentLife: 2.5,
    organicChurn: 0.075
  },
  micro: {
    tuition: 15000,
    timeback: 3000,
    coachSalary: 3750,
    realEstate: 2500,
    lifeSkills: 1000,
    misc: 1250,
    studentsPerSchool: 25,
    tofMarketing: 500,
    bofMarketing: 2500,
    fillRateYr1: 0.70,
    fillRateYr2: 1.0,
    avgStudentLife: 2.5,
    organicChurn: 0.075
  },
  midSized: {
    tuition: 25000,
    timeback: 5000,
    headcount: 5232.5,
    // P&L operational expense
    programs: 3000,
    // P&L operational expense
    misc: 1500,
    // P&L operational expense
    studentsRenovated: 400,
    studentsNewBuild: 1000,
    purchaseRenovated: 1000000,
    capexRenovated: 14000000,
    purchaseNewBuild: 10000000,
    capexNewBuild: 40000000,
    blendRatio: 0.5,
    tofMarketing: 1000,
    bofMarketing: 4000,
    fillRates: [0, 0.33, 0.67, 1.0],
    avgStudentLife: 4.5,
    organicChurn: 0.075,
    annualFacilitiesRenovated: 865868,
    // Annual facilities operating cost per school
    annualFacilitiesNewBuild: 1165868
  },
  flagship: {
    tuition: 50000,
    timeback: 10000,
    headcount: 5244,
    // P&L operational expense (1500-student model)
    programs: 3000,
    // P&L operational expense
    misc: 1500,
    // P&L operational expense
    studentsPerSchool: 1500,
    tofMarketing: 2000,
    bofMarketing: 8000,
    fillRates: [0, 0, 0.33, 0.67, 1.0],
    avgStudentLife: 6.5,
    organicChurn: 0.075,
    annualFacilitiesPerSchool: 1500000 // Annual facilities operating cost per school
  }
};

// School count trajectories
const BASE_TRAJECTORIES = {
  virtual: [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 100000],
  microSchools: [20, 60, 180, 540, 1620, 4000, 4000, 4000, 4000, 4000, 4000],
  midSizedSchools: [2, 10, 20, 50, 100, 150, 200, 250, 400, 625, 800],
  flagshipSchools: [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4]
};
const YEARS = ['SY26', 'SY27', 'SY28', 'SY29', 'SY30', 'SY31', 'SY32', 'SY33', 'SY34', 'SY35', 'SY36'];
const COLORS = {
  virtual: '#3B82F6',
  micro: '#10B981',
  midSized: '#F59E0B',
  flagship: '#8B5CF6',
  revenue: '#3B82F6',
  ebitda: '#10B981',
  capex: '#EF4444',
  timeback: '#F59E0B'
};
const formatCurrency = (value, compact = false) => {
  if (value === 0) return '$0';
  if (compact) {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};
const formatNumber = (value, compact = false) => {
  if (compact) {
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(value);
};

// Scenario presets
const SCENARIOS = {
  conservative: {
    name: 'Conservative',
    description: 'Slower growth, higher costs',
    virtualGrowthMult: 0.8,
    microGrowthMult: 0.7,
    midSizedGrowthMult: 0.6,
    flagshipCapex: 150000000,
    ebitdaMultiple: 12,
    costInflation: 1.1
  },
  base: {
    name: 'Base Case',
    description: 'Current model assumptions',
    virtualGrowthMult: 1.0,
    microGrowthMult: 1.0,
    midSizedGrowthMult: 1.0,
    flagshipCapex: 75000000,
    ebitdaMultiple: 17.5,
    costInflation: 1.0
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Faster growth, better margins',
    virtualGrowthMult: 1.2,
    microGrowthMult: 1.3,
    midSizedGrowthMult: 1.2,
    flagshipCapex: 60000000,
    ebitdaMultiple: 22,
    costInflation: 0.95
  }
};

// Calculate model outputs
function calculateModel(params, trajectories) {
  const years = [];
  let prevMicroSchools = 6;
  let prevMidSizedSchools = 0;
  let prevFlagshipSchools = 0;

  // Track previous year students for marketing calculation
  // Seed with initial students (matching Excel pilot phase)
  let prevMicroStudents = 150; // 6 existing schools * 25 students
  let prevMidSizedStudents = 40;
  let prevFlagshipStudents = 0;

  // Track school ages for fill rate calculation
  let midSizedSchoolAges = [];
  let flagshipSchoolAges = [];
  for (let i = 0; i < 11; i++) {
    const year = YEARS[i];

    // Virtual Schools
    const virtualStudents = Math.round(trajectories.virtual[i] * params.virtualGrowthMult);
    const virtualTuition = BASE_ASSUMPTIONS.virtual.tuition;
    const virtualRevenue = virtualStudents * virtualTuition;
    const virtualExpenses = virtualStudents * (BASE_ASSUMPTIONS.virtual.headcount + BASE_ASSUMPTIONS.virtual.programs + BASE_ASSUMPTIONS.virtual.misc + BASE_ASSUMPTIONS.virtual.timeback) * params.costInflation;
    const virtualTimeback = virtualStudents * BASE_ASSUMPTIONS.virtual.timeback;
    // Calculate new students for marketing
    // Year 1: only organic churn (no prior cohort to roll over)
    // Year 2+: organic churn + rollover churn
    const virtualOrganicChurn = BASE_ASSUMPTIONS.virtual.organicChurn;
    const virtualRolloverChurn = 1 / BASE_ASSUMPTIONS.virtual.avgStudentLife;
    const virtualNewStudents = i === 0 ? virtualStudents // First year: all students are new
    : Math.max(0, Math.round(virtualStudents - trajectories.virtual[i - 1] * params.virtualGrowthMult * (1 - virtualOrganicChurn - virtualRolloverChurn)));
    const virtualMarketing = virtualNewStudents * (BASE_ASSUMPTIONS.virtual.tofMarketing + BASE_ASSUMPTIONS.virtual.bofMarketing);
    const virtualEBITDA = virtualRevenue - virtualExpenses - virtualMarketing;

    // Microschools
    const microSchools = Math.round(trajectories.microSchools[i] * params.microGrowthMult);
    const newMicroSchools = Math.max(0, microSchools - prevMicroSchools);
    const existingMicroSchools = prevMicroSchools;
    const microStudents = Math.round(existingMicroSchools * BASE_ASSUMPTIONS.micro.studentsPerSchool + newMicroSchools * BASE_ASSUMPTIONS.micro.fillRateYr1 * BASE_ASSUMPTIONS.micro.studentsPerSchool);
    const microRevenue = microStudents * BASE_ASSUMPTIONS.micro.tuition;
    const microExpenses = microStudents * (BASE_ASSUMPTIONS.micro.coachSalary + BASE_ASSUMPTIONS.micro.realEstate + BASE_ASSUMPTIONS.micro.lifeSkills + BASE_ASSUMPTIONS.micro.misc + BASE_ASSUMPTIONS.micro.timeback) * params.costInflation;
    const microTimeback = microStudents * BASE_ASSUMPTIONS.micro.timeback;
    // Calculate new students for marketing
    // Year 1: only organic churn (no prior cohort to roll over)
    // Year 2+: organic churn + rollover churn
    const microOrganicRetained = Math.round(prevMicroStudents * (1 - BASE_ASSUMPTIONS.micro.organicChurn));
    const microRolloverLoss = i === 0 ? 0 : Math.round(prevMicroStudents / BASE_ASSUMPTIONS.micro.avgStudentLife);
    const microNewStudents = Math.max(0, microStudents - microOrganicRetained + microRolloverLoss);
    const microMarketing = microNewStudents * (BASE_ASSUMPTIONS.micro.tofMarketing + BASE_ASSUMPTIONS.micro.bofMarketing);
    const microEBITDA = microRevenue - microExpenses - microMarketing;
    prevMicroSchools = microSchools;
    prevMicroStudents = microStudents;

    // Mid-Sized Schools
    const midSizedSchools = Math.round(trajectories.midSizedSchools[i] * params.midSizedGrowthMult);
    const newMidSized = Math.max(0, midSizedSchools - prevMidSizedSchools);

    // Update school ages
    midSizedSchoolAges = midSizedSchoolAges.map(age => age + 1);
    for (let j = 0; j < newMidSized; j++) {
      midSizedSchoolAges.push(0);
    }

    // Calculate students based on fill rates by school age
    const studentsPerMidSized = BASE_ASSUMPTIONS.midSized.studentsRenovated * BASE_ASSUMPTIONS.midSized.blendRatio + BASE_ASSUMPTIONS.midSized.studentsNewBuild * (1 - BASE_ASSUMPTIONS.midSized.blendRatio);
    let midSizedStudents = 0;
    midSizedSchoolAges.forEach(age => {
      const fillRate = BASE_ASSUMPTIONS.midSized.fillRates[Math.min(age, 3)];
      midSizedStudents += Math.round(studentsPerMidSized * fillRate);
    });
    // In Year 1, maintain pilot students when schools haven't ramped up yet
    if (i === 0 && midSizedStudents < prevMidSizedStudents) {
      midSizedStudents = prevMidSizedStudents;
    }
    const midSizedRevenue = midSizedStudents * BASE_ASSUMPTIONS.midSized.tuition;
    const midSizedTimeback = midSizedStudents * BASE_ASSUMPTIONS.midSized.timeback;
    // Operating Expenses: headcount + programs + misc + timeback
    const midSizedExpenses = midSizedStudents * (BASE_ASSUMPTIONS.midSized.headcount + BASE_ASSUMPTIONS.midSized.programs + BASE_ASSUMPTIONS.midSized.misc + BASE_ASSUMPTIONS.midSized.timeback) * params.costInflation;

    // Calculate new students for marketing
    // Year 1: only organic churn (no prior cohort to roll over)
    // Year 2+: organic churn + rollover churn
    const midSizedOrganicRetained = Math.round(prevMidSizedStudents * (1 - BASE_ASSUMPTIONS.midSized.organicChurn));
    const midSizedRolloverLoss = i === 0 ? 0 : Math.round(prevMidSizedStudents / BASE_ASSUMPTIONS.midSized.avgStudentLife);
    const midSizedNewStudents = Math.max(0, midSizedStudents - midSizedOrganicRetained + midSizedRolloverLoss);
    const midSizedMarketing = midSizedNewStudents * (BASE_ASSUMPTIONS.midSized.tofMarketing + BASE_ASSUMPTIONS.midSized.bofMarketing);
    // Annual facilities operating cost (blended per school)
    const midSizedAnnualFacilities = midSizedSchools * (BASE_ASSUMPTIONS.midSized.annualFacilitiesRenovated * BASE_ASSUMPTIONS.midSized.blendRatio + BASE_ASSUMPTIONS.midSized.annualFacilitiesNewBuild * (1 - BASE_ASSUMPTIONS.midSized.blendRatio));
    const midSizedEBITDA = midSizedRevenue - midSizedExpenses - midSizedMarketing - midSizedAnnualFacilities;

    // Mid-sized CapEx
    const midSizedCapexPerSchool = (BASE_ASSUMPTIONS.midSized.purchaseRenovated + BASE_ASSUMPTIONS.midSized.capexRenovated) * BASE_ASSUMPTIONS.midSized.blendRatio + (BASE_ASSUMPTIONS.midSized.purchaseNewBuild + BASE_ASSUMPTIONS.midSized.capexNewBuild) * (1 - BASE_ASSUMPTIONS.midSized.blendRatio);
    const midSizedCapex = newMidSized * midSizedCapexPerSchool;
    prevMidSizedSchools = midSizedSchools;
    prevMidSizedStudents = midSizedStudents;

    // Flagship Schools
    const flagshipSchools = trajectories.flagshipSchools[i];
    const newFlagship = Math.max(0, flagshipSchools - prevFlagshipSchools);

    // Update flagship ages
    flagshipSchoolAges = flagshipSchoolAges.map(age => age + 1);
    for (let j = 0; j < newFlagship; j++) {
      flagshipSchoolAges.push(0);
    }
    let flagshipStudents = 0;
    flagshipSchoolAges.forEach(age => {
      const fillRate = BASE_ASSUMPTIONS.flagship.fillRates[Math.min(age, 4)];
      flagshipStudents += Math.round(BASE_ASSUMPTIONS.flagship.studentsPerSchool * fillRate);
    });
    const flagshipRevenue = flagshipStudents * BASE_ASSUMPTIONS.flagship.tuition;
    const flagshipTimeback = flagshipStudents * BASE_ASSUMPTIONS.flagship.timeback;
    // Operating Expenses: headcount + programs + misc + timeback
    const flagshipExpenses = flagshipStudents * (BASE_ASSUMPTIONS.flagship.headcount + BASE_ASSUMPTIONS.flagship.programs + BASE_ASSUMPTIONS.flagship.misc + BASE_ASSUMPTIONS.flagship.timeback) * params.costInflation;

    // Calculate new students for marketing
    // Year 1: only organic churn (no prior cohort to roll over)
    // Year 2+: organic churn + rollover churn
    const flagshipOrganicRetained = Math.round(prevFlagshipStudents * (1 - BASE_ASSUMPTIONS.flagship.organicChurn));
    const flagshipRolloverLoss = i === 0 ? 0 : Math.round(prevFlagshipStudents / BASE_ASSUMPTIONS.flagship.avgStudentLife);
    const flagshipNewStudents = Math.max(0, flagshipStudents - flagshipOrganicRetained + flagshipRolloverLoss);
    const flagshipMarketing = flagshipNewStudents * (BASE_ASSUMPTIONS.flagship.tofMarketing + BASE_ASSUMPTIONS.flagship.bofMarketing);
    // Annual facilities operating cost
    const flagshipAnnualFacilities = flagshipSchools * BASE_ASSUMPTIONS.flagship.annualFacilitiesPerSchool;
    const flagshipEBITDA = flagshipRevenue - flagshipExpenses - flagshipMarketing - flagshipAnnualFacilities;
    const flagshipCapex = newFlagship * params.flagshipCapex;
    prevFlagshipSchools = flagshipSchools;
    prevFlagshipStudents = flagshipStudents;

    // Totals
    const totalStudents = virtualStudents + microStudents + midSizedStudents + flagshipStudents;
    const totalRevenue = virtualRevenue + microRevenue + midSizedRevenue + flagshipRevenue;
    const totalEBITDA = virtualEBITDA + microEBITDA + midSizedEBITDA + flagshipEBITDA;
    const totalTimeback = virtualTimeback + microTimeback + midSizedTimeback + flagshipTimeback;
    const totalCapex = midSizedCapex + flagshipCapex;
    const netCashFlow = totalEBITDA - totalCapex;
    years.push({
      year,
      virtualStudents,
      virtualRevenue,
      virtualEBITDA,
      virtualTimeback,
      microSchools,
      microStudents,
      microRevenue,
      microEBITDA,
      microTimeback,
      midSizedSchools,
      midSizedStudents,
      midSizedRevenue,
      midSizedEBITDA,
      midSizedTimeback,
      midSizedCapex,
      flagshipSchools,
      flagshipStudents,
      flagshipRevenue,
      flagshipEBITDA,
      flagshipTimeback,
      flagshipCapex,
      totalStudents,
      totalRevenue,
      totalEBITDA,
      totalTimeback,
      totalCapex,
      netCashFlow,
      cumulativeCashFlow: 0,
      // Will calculate below
      ebitdaMargin: totalRevenue > 0 ? totalEBITDA / totalRevenue : 0,
      timebackPct: totalRevenue > 0 ? totalTimeback / totalRevenue : 0
    });
  }

  // Calculate cumulative cash flow
  let cumulative = 0;
  years.forEach(y => {
    cumulative += y.netCashFlow;
    y.cumulativeCashFlow = cumulative;
  });

  // Calculate summary metrics
  const year10 = years[10];
  const propertyValue = year10.midSizedSchools * 30000000 + year10.flagshipSchools * 100000000;
  const terminalValue = year10.totalEBITDA * params.ebitdaMultiple + propertyValue;
  const cumulativeCapex = years.reduce((sum, y) => sum + y.totalCapex, 0);
  const peakFunding = Math.abs(Math.min(0, ...years.map(y => y.cumulativeCashFlow)));
  const breakeven = years.findIndex(y => y.cumulativeCashFlow > 0);
  return {
    years,
    summary: {
      totalStudents: year10.totalStudents,
      totalRevenue: year10.totalRevenue,
      totalEBITDA: year10.totalEBITDA,
      ebitdaMargin: year10.ebitdaMargin,
      terminalValue,
      propertyValue,
      cumulativeCapex,
      peakFunding,
      breakeven
    }
  };
}

// Monte Carlo simulation
function runMonteCarlo(params, trajectories, iterations = 500) {
  const results = [];
  for (let i = 0; i < iterations; i++) {
    // Randomize parameters with ±20% variation
    const randomParams = {
      virtualGrowthMult: params.virtualGrowthMult * (0.8 + Math.random() * 0.4),
      microGrowthMult: params.microGrowthMult * (0.8 + Math.random() * 0.4),
      midSizedGrowthMult: params.midSizedGrowthMult * (0.7 + Math.random() * 0.6),
      flagshipCapex: params.flagshipCapex * (0.8 + Math.random() * 0.4),
      ebitdaMultiple: params.ebitdaMultiple * (0.7 + Math.random() * 0.6),
      costInflation: params.costInflation * (0.9 + Math.random() * 0.2)
    };
    const model = calculateModel(randomParams, trajectories);
    results.push({
      terminalValue: model.summary.terminalValue,
      revenue: model.summary.totalRevenue,
      ebitda: model.summary.totalEBITDA,
      students: model.summary.totalStudents
    });
  }

  // Sort by terminal value
  results.sort((a, b) => a.terminalValue - b.terminalValue);
  return {
    p10: results[Math.floor(iterations * 0.1)],
    p25: results[Math.floor(iterations * 0.25)],
    p50: results[Math.floor(iterations * 0.5)],
    p75: results[Math.floor(iterations * 0.75)],
    p90: results[Math.floor(iterations * 0.9)],
    mean: {
      terminalValue: results.reduce((sum, r) => sum + r.terminalValue, 0) / iterations,
      revenue: results.reduce((sum, r) => sum + r.revenue, 0) / iterations,
      ebitda: results.reduce((sum, r) => sum + r.ebitda, 0) / iterations
    },
    all: results
  };
}

// Sensitivity analysis
function runSensitivity(params, trajectories, paramName, range) {
  const results = [];
  const steps = 21;
  const [minMult, maxMult] = range;
  for (let i = 0; i < steps; i++) {
    const mult = minMult + (maxMult - minMult) * (i / (steps - 1));
    const testParams = {
      ...params,
      [paramName]: params[paramName] * mult
    };
    const model = calculateModel(testParams, trajectories);
    results.push({
      multiplier: mult,
      terminalValue: model.summary.terminalValue,
      revenue: model.summary.totalRevenue,
      ebitda: model.summary.totalEBITDA
    });
  }
  return results;
}

// Goal Seek function - find growth rate needed for target
function goalSeek(params, trajectories, targetMetric, targetValue, paramToAdjust, tolerance = 0.01) {
  let low = 0.1;
  let high = 3.0;
  let iterations = 0;
  const maxIterations = 50;
  while (iterations < maxIterations && high - low > tolerance) {
    const mid = (low + high) / 2;
    const testParams = {
      ...params,
      [paramToAdjust]: mid
    };
    const model = calculateModel(testParams, trajectories);
    let currentValue;
    switch (targetMetric) {
      case 'terminalValue':
        currentValue = model.summary.terminalValue;
        break;
      case 'revenue':
        currentValue = model.summary.totalRevenue;
        break;
      case 'ebitda':
        currentValue = model.summary.totalEBITDA;
        break;
      case 'students':
        currentValue = model.summary.totalStudents;
        break;
      default:
        currentValue = model.summary.terminalValue;
    }
    if (currentValue < targetValue) {
      low = mid;
    } else {
      high = mid;
    }
    iterations++;
  }
  return (low + high) / 2;
}

// Lucide Icon component
function Icon({
  name,
  size = 24,
  className = ''
}) {
  const iconRef = useRef(null);
  useEffect(() => {
    if (iconRef.current && window.lucide) {
      iconRef.current.innerHTML = '';
      const iconElement = document.createElement('i');
      iconElement.setAttribute('data-lucide', name);
      iconRef.current.appendChild(iconElement);
      lucide.createIcons({
        nodes: [iconElement]
      });
    }
  }, [name]);
  return /*#__PURE__*/React.createElement("span", {
    ref: iconRef,
    className: `inline-flex items-center justify-center ${className}`,
    style: {
      width: size,
      height: size
    }
  });
}

// Components
function MetricCard({
  title,
  value,
  subValue,
  icon,
  color = 'blue'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: `rounded-xl border-2 p-4 ${colorClasses[color]}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-medium opacity-80"
  }, title), /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    className: "opacity-60"
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-bold"
  }, value), subValue && /*#__PURE__*/React.createElement("div", {
    className: "text-sm opacity-70 mt-1"
  }, subValue));
}
function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  format = 'percent'
}) {
  const displayValue = format === 'percent' ? `${(value * 100).toFixed(0)}%` : format === 'currency' ? formatCurrency(value, true) : format === 'multiple' ? `${value.toFixed(1)}x` : value;
  return /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between mb-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-sm font-medium text-gray-700"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-bold text-gray-900"
  }, displayValue)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(parseFloat(e.target.value)),
    className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
  }));
}
function ScenarioButton({
  scenario,
  isActive,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    className: `px-4 py-2 rounded-lg font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
  }, scenario.name);
}
function TabButton({
  children,
  isActive,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    className: `px-4 py-2 font-medium transition-all border-b-2 ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`
  }, children);
}

// Goal Seek Panel Component
function GoalSeekPanel({
  params,
  onApplyResult
}) {
  const [targetMetric, setTargetMetric] = useState('terminalValue');
  const [targetValue, setTargetValue] = useState(5000000000);
  const [paramToAdjust, setParamToAdjust] = useState('midSizedGrowthMult');
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const requiredValue = goalSeek(params, BASE_TRAJECTORIES, targetMetric, targetValue, paramToAdjust);
      setResult(requiredValue);
      setIsCalculating(false);
    }, 100);
  };
  const metricLabels = {
    terminalValue: 'Terminal Value',
    revenue: 'Year 10 Revenue',
    ebitda: 'Year 10 EBITDA',
    students: 'Year 10 Students'
  };
  const paramLabels = {
    virtualGrowthMult: 'Virtual Growth Rate',
    microGrowthMult: 'Micro Growth Rate',
    midSizedGrowthMult: 'Mid-Sized Growth Rate',
    ebitdaMultiple: 'EBITDA Multiple'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-gray-900 mb-4 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "target",
    size: 20
  }), "Goal Seek / Solver"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600 mb-4"
  }, "Find the required growth rate to achieve a specific target outcome."), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700 mb-1"
  }, "Target Metric"), /*#__PURE__*/React.createElement("select", {
    value: targetMetric,
    onChange: e => setTargetMetric(e.target.value),
    className: "w-full p-2 border rounded-lg bg-white"
  }, Object.entries(metricLabels).map(([key, label]) => /*#__PURE__*/React.createElement("option", {
    key: key,
    value: key
  }, label)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700 mb-1"
  }, "Target Value"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: formatCurrency(targetValue, true),
    onChange: e => {
      const val = e.target.value.replace(/[^0-9.]/g, '');
      const multiplier = e.target.value.includes('B') ? 1e9 : e.target.value.includes('M') ? 1e6 : e.target.value.includes('K') ? 1e3 : 1;
      setTargetValue(parseFloat(val) * multiplier || 0);
    },
    className: "w-full p-2 border rounded-lg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mt-1"
  }, [1e9, 3e9, 5e9, 10e9].map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setTargetValue(v),
    className: "text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
  }, formatCurrency(v, true))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700 mb-1"
  }, "Parameter to Adjust"), /*#__PURE__*/React.createElement("select", {
    value: paramToAdjust,
    onChange: e => setParamToAdjust(e.target.value),
    className: "w-full p-2 border rounded-lg bg-white"
  }, Object.entries(paramLabels).map(([key, label]) => /*#__PURE__*/React.createElement("option", {
    key: key,
    value: key
  }, label))))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleCalculate,
    disabled: isCalculating,
    className: "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calculator",
    size: 18
  }), isCalculating ? 'Calculating...' : 'Calculate Required Value'), result !== null && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4 bg-white px-4 py-2 rounded-lg border"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-sm text-gray-600"
  }, "Required ", paramLabels[paramToAdjust], ":"), /*#__PURE__*/React.createElement("span", {
    className: "ml-2 font-bold text-indigo-600"
  }, paramToAdjust.includes('Multiple') ? `${result.toFixed(1)}x` : `${(result * 100).toFixed(0)}%`)), /*#__PURE__*/React.createElement("button", {
    onClick: () => onApplyResult(paramToAdjust, result),
    className: "px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
  }, "Apply"))));
}

// Unit Economics Component
function UnitEconomicsPanel({
  model
}) {
  const [selectedTier, setSelectedTier] = useState('virtual');

  // Calculate amortized marketing (CAC spread over average student life)
  const getAmortizedMarketing = tier => {
    const cac = BASE_ASSUMPTIONS[tier].tofMarketing + BASE_ASSUMPTIONS[tier].bofMarketing;
    return cac / BASE_ASSUMPTIONS[tier].avgStudentLife;
  };
  const tierData = {
    virtual: {
      name: 'Virtual Schools',
      color: COLORS.virtual,
      tuition: BASE_ASSUMPTIONS.virtual.tuition,
      costs: [{
        name: 'Headcount',
        value: BASE_ASSUMPTIONS.virtual.headcount
      }, {
        name: 'Programs',
        value: BASE_ASSUMPTIONS.virtual.programs
      }, {
        name: 'Timeback',
        value: BASE_ASSUMPTIONS.virtual.timeback
      }, {
        name: 'Misc',
        value: BASE_ASSUMPTIONS.virtual.misc
      }, {
        name: 'Marketing (amortized)',
        value: getAmortizedMarketing('virtual'),
        isMarketing: true
      }],
      students: model.years[10].virtualStudents,
      revenue: model.years[10].virtualRevenue,
      ebitda: model.years[10].virtualEBITDA
    },
    micro: {
      name: 'Microschools',
      color: COLORS.micro,
      tuition: BASE_ASSUMPTIONS.micro.tuition,
      costs: [{
        name: 'Coach Salary',
        value: BASE_ASSUMPTIONS.micro.coachSalary
      }, {
        name: 'Real Estate',
        value: BASE_ASSUMPTIONS.micro.realEstate
      }, {
        name: 'Life Skills',
        value: BASE_ASSUMPTIONS.micro.lifeSkills
      }, {
        name: 'Timeback',
        value: BASE_ASSUMPTIONS.micro.timeback
      }, {
        name: 'Misc',
        value: BASE_ASSUMPTIONS.micro.misc
      }, {
        name: 'Marketing (amortized)',
        value: getAmortizedMarketing('micro'),
        isMarketing: true
      }],
      students: model.years[10].microStudents,
      revenue: model.years[10].microRevenue,
      ebitda: model.years[10].microEBITDA
    },
    midSized: {
      name: 'Mid-Sized Schools',
      color: COLORS.midSized,
      tuition: BASE_ASSUMPTIONS.midSized.tuition,
      costs: [{
        name: 'Headcount',
        value: BASE_ASSUMPTIONS.midSized.headcount
      }, {
        name: 'Programs',
        value: BASE_ASSUMPTIONS.midSized.programs
      }, {
        name: 'Misc',
        value: BASE_ASSUMPTIONS.midSized.misc
      }, {
        name: 'Timeback',
        value: BASE_ASSUMPTIONS.midSized.timeback
      }, {
        name: 'Marketing (amortized)',
        value: getAmortizedMarketing('midSized'),
        isMarketing: true
      }],
      students: model.years[10].midSizedStudents,
      revenue: model.years[10].midSizedRevenue,
      ebitda: model.years[10].midSizedEBITDA
    },
    flagship: {
      name: 'Flagship Campuses',
      color: COLORS.flagship,
      tuition: BASE_ASSUMPTIONS.flagship.tuition,
      costs: [{
        name: 'Headcount',
        value: BASE_ASSUMPTIONS.flagship.headcount
      }, {
        name: 'Programs',
        value: BASE_ASSUMPTIONS.flagship.programs
      }, {
        name: 'Misc',
        value: BASE_ASSUMPTIONS.flagship.misc
      }, {
        name: 'Timeback',
        value: BASE_ASSUMPTIONS.flagship.timeback
      }, {
        name: 'Marketing (amortized)',
        value: getAmortizedMarketing('flagship'),
        isMarketing: true
      }],
      students: model.years[10].flagshipStudents,
      revenue: model.years[10].flagshipRevenue,
      ebitda: model.years[10].flagshipEBITDA
    }
  };
  const tier = tierData[selectedTier];
  const totalCosts = tier.costs.reduce((sum, c) => sum + c.value, 0);
  const margin = tier.tuition - totalCosts;
  const marginPct = (margin / tier.tuition * 100).toFixed(1);

  // CAC/LTV calculation
  const cac = BASE_ASSUMPTIONS[selectedTier].tofMarketing + BASE_ASSUMPTIONS[selectedTier].bofMarketing;
  const avgLife = BASE_ASSUMPTIONS[selectedTier].avgStudentLife;
  const ltv = margin * avgLife;
  const ltvCacRatio = (ltv / cac).toFixed(1);
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 flex-wrap"
  }, Object.entries(tierData).map(([key, data]) => /*#__PURE__*/React.createElement("button", {
    key: key,
    onClick: () => setSelectedTier(key),
    className: `px-4 py-2 rounded-lg font-medium transition-all ${selectedTier === key ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`,
    style: selectedTier === key ? {
      backgroundColor: data.color
    } : {}
  }, data.name))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl border p-6"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Per-Student Unit Economics"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center py-2 border-b border-gray-100"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-medium text-gray-900"
  }, "Tuition Revenue"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-green-600"
  }, formatCurrency(tier.tuition))), tier.costs.map((cost, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: `flex justify-between items-center py-2 border-b border-gray-100 ${cost.isMarketing ? 'bg-orange-50 -mx-2 px-2 rounded' : ''}`
  }, /*#__PURE__*/React.createElement("span", {
    className: cost.isMarketing ? 'text-orange-700' : 'text-gray-600'
  }, "\u2212 ", cost.name, cost.isMarketing && /*#__PURE__*/React.createElement("span", {
    className: "text-xs ml-1"
  }, "(CAC \xF7 ", avgLife, " yrs)")), /*#__PURE__*/React.createElement("span", {
    className: cost.isMarketing ? 'text-orange-600' : 'text-red-600'
  }, "(", formatCurrency(cost.value), ")"))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3 mt-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-gray-900"
  }, "Contribution Margin"), /*#__PURE__*/React.createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-lg",
    style: {
      color: tier.color
    }
  }, formatCurrency(margin)), /*#__PURE__*/React.createElement("span", {
    className: "text-sm text-gray-500 ml-2"
  }, "(", marginPct, "%)"))), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mt-2 italic"
  }, "* Marketing is paid upfront but amortized over the ", avgLife, "-year average student life"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl border p-6"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-gray-900 mb-4"
  }, "CAC / LTV Analysis"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4 mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-red-50 rounded-lg p-4 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-red-700 mb-1"
  }, "Customer Acquisition Cost"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-bold text-red-900"
  }, formatCurrency(cac))), /*#__PURE__*/React.createElement("div", {
    className: "bg-green-50 rounded-lg p-4 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-green-700 mb-1"
  }, "Lifetime Value"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-bold text-green-900"
  }, formatCurrency(ltv)))), /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-blue-700 mb-1"
  }, "LTV:CAC Ratio"), /*#__PURE__*/React.createElement("p", {
    className: "text-3xl font-bold text-blue-900"
  }, ltvCacRatio, "x"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-blue-600 mt-1"
  }, ltvCacRatio >= 3 ? '✓ Healthy (>3x)' : ltvCacRatio >= 2 ? '⚠ Acceptable' : '✗ Needs improvement')), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 text-sm text-gray-500"
  }, /*#__PURE__*/React.createElement("p", null, "Avg. Student Life: ", avgLife, " years"), /*#__PURE__*/React.createElement("p", null, "Payback Period: ", (cac / margin).toFixed(1), " years")))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl border p-6"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Year 10 ", tier.name, " Summary"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-4 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "Students"), /*#__PURE__*/React.createElement("p", {
    className: "text-xl font-bold"
  }, formatNumber(tier.students, true))), /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "Revenue"), /*#__PURE__*/React.createElement("p", {
    className: "text-xl font-bold text-green-600"
  }, formatCurrency(tier.revenue, true))), /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "EBITDA"), /*#__PURE__*/React.createElement("p", {
    className: "text-xl font-bold",
    style: {
      color: tier.color
    }
  }, formatCurrency(tier.ebitda, true))), /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "EBITDA Margin"), /*#__PURE__*/React.createElement("p", {
    className: "text-xl font-bold"
  }, tier.revenue > 0 ? (tier.ebitda / tier.revenue * 100).toFixed(1) : 0, "%")))));
}

// Data Table Component
function DataTableView({
  model,
  viewMode = 'students'
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const columns = {
    students: [{
      key: 'year',
      label: 'Year',
      format: v => v
    }, {
      key: 'virtualStudents',
      label: 'Virtual',
      format: v => formatNumber(v, true)
    }, {
      key: 'microStudents',
      label: 'Micro',
      format: v => formatNumber(v, true)
    }, {
      key: 'midSizedStudents',
      label: 'Mid-Sized',
      format: v => formatNumber(v, true)
    }, {
      key: 'flagshipStudents',
      label: 'Flagship',
      format: v => formatNumber(v, true)
    }, {
      key: 'totalStudents',
      label: 'Total',
      format: v => formatNumber(v, true),
      bold: true
    }],
    revenue: [{
      key: 'year',
      label: 'Year',
      format: v => v
    }, {
      key: 'virtualRevenue',
      label: 'Virtual',
      format: v => formatCurrency(v, true),
      color: 'text-blue-600'
    }, {
      key: 'microRevenue',
      label: 'Micro',
      format: v => formatCurrency(v, true),
      color: 'text-emerald-600'
    }, {
      key: 'midSizedRevenue',
      label: 'Mid-Sized',
      format: v => formatCurrency(v, true),
      color: 'text-amber-600'
    }, {
      key: 'flagshipRevenue',
      label: 'Flagship',
      format: v => formatCurrency(v, true),
      color: 'text-purple-600'
    }, {
      key: 'totalRevenue',
      label: 'Total',
      format: v => formatCurrency(v, true),
      bold: true
    }],
    ebitda: [{
      key: 'year',
      label: 'Year',
      format: v => v
    }, {
      key: 'virtualEBITDA',
      label: 'Virtual',
      format: v => formatCurrency(v, true),
      color: 'text-blue-600'
    }, {
      key: 'microEBITDA',
      label: 'Micro',
      format: v => formatCurrency(v, true),
      color: 'text-emerald-600'
    }, {
      key: 'midSizedEBITDA',
      label: 'Mid-Sized',
      format: v => formatCurrency(v, true),
      color: 'text-amber-600'
    }, {
      key: 'flagshipEBITDA',
      label: 'Flagship',
      format: v => formatCurrency(v, true),
      color: 'text-purple-600'
    }, {
      key: 'totalEBITDA',
      label: 'Total',
      format: v => formatCurrency(v, true),
      bold: true
    }, {
      key: 'ebitdaMargin',
      label: 'Margin',
      format: v => `${(v * 100).toFixed(1)}%`
    }],
    cashflow: [{
      key: 'year',
      label: 'Year',
      format: v => v
    }, {
      key: 'totalEBITDA',
      label: 'EBITDA',
      format: v => formatCurrency(v, true),
      color: 'text-green-600'
    }, {
      key: 'totalCapex',
      label: 'CapEx',
      format: v => formatCurrency(v, true),
      color: 'text-red-600'
    }, {
      key: 'netCashFlow',
      label: 'Net CF',
      format: v => formatCurrency(v, true)
    }, {
      key: 'cumulativeCashFlow',
      label: 'Cumulative',
      format: v => formatCurrency(v, true),
      bold: true
    }]
  };
  const cols = columns[viewMode];
  let sortedData = [...model.years];
  if (sortColumn) {
    sortedData.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }
  const handleSort = key => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-sm"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "border-b bg-gray-50"
  }, cols.map(col => /*#__PURE__*/React.createElement("th", {
    key: col.key,
    onClick: () => handleSort(col.key),
    className: "text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, col.label, sortColumn === col.key && /*#__PURE__*/React.createElement("span", null, sortDirection === 'asc' ? '↑' : '↓')))))), /*#__PURE__*/React.createElement("tbody", null, sortedData.map((row, idx) => /*#__PURE__*/React.createElement("tr", {
    key: row.year,
    className: `border-b hover:bg-gray-50 ${idx === 10 ? 'bg-blue-50' : ''}`
  }, cols.map(col => /*#__PURE__*/React.createElement("td", {
    key: col.key,
    className: `py-3 px-4 ${col.bold ? 'font-bold' : ''} ${col.color || ''}`
  }, col.format(row[col.key]))))))));
}

// Value Creation Waterfall Component
function ValueCreationWaterfall({
  model,
  params
}) {
  const year10 = model.years[10];
  const waterfallData = [{
    name: 'Virtual EBITDA',
    value: year10.virtualEBITDA * params.ebitdaMultiple,
    fill: COLORS.virtual
  }, {
    name: 'Micro EBITDA',
    value: year10.microEBITDA * params.ebitdaMultiple,
    fill: COLORS.micro
  }, {
    name: 'Mid-Sized EBITDA',
    value: year10.midSizedEBITDA * params.ebitdaMultiple,
    fill: COLORS.midSized
  }, {
    name: 'Flagship EBITDA',
    value: year10.flagshipEBITDA * params.ebitdaMultiple,
    fill: COLORS.flagship
  }, {
    name: 'Property Value',
    value: year10.midSizedSchools * 30000000 + year10.flagshipSchools * 100000000,
    fill: '#6B7280'
  }];

  // Calculate running total for waterfall positioning
  let runningTotal = 0;
  const processedData = waterfallData.map(item => {
    const start = runningTotal;
    runningTotal += item.value;
    return {
      ...item,
      start,
      end: runningTotal
    };
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Value Creation Breakdown"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 300
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: waterfallData,
    layout: "vertical"
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement(XAxis, {
    type: "number",
    tickFormatter: v => formatCurrency(v, true),
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    type: "category",
    dataKey: "name",
    tick: {
      fontSize: 12
    },
    width: 120
  }), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: v => formatCurrency(v, true)
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "value",
    radius: [0, 4, 4, 0]
  }, waterfallData.map((entry, index) => /*#__PURE__*/React.createElement(Cell, {
    key: `cell-${index}`,
    fill: entry.fill
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, waterfallData.map((item, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-4 h-4 rounded",
    style: {
      backgroundColor: item.fill
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-medium"
  }, item.name)), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, formatCurrency(item.value, true)))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-blue-300"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-lg"
  }, "Total Terminal Value"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-2xl text-blue-700"
  }, formatCurrency(model.summary.terminalValue, true))))));
}
function TSAScenarioModel() {
  const [activeScenario, setActiveScenario] = useState('base');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [monteCarloResults, setMonteCarloResults] = useState(null);
  const [isRunningMC, setIsRunningMC] = useState(false);
  const [showDataTable, setShowDataTable] = useState(false);
  const [dataTableView, setDataTableView] = useState('students');

  // Editable parameters
  const [params, setParams] = useState({
    virtualGrowthMult: 1.0,
    microGrowthMult: 1.0,
    midSizedGrowthMult: 1.0,
    flagshipCapex: 75000000,
    ebitdaMultiple: 17.5,
    costInflation: 1.0
  });

  // Initialize Lucide icons after component mount
  useEffect(() => {
    if (window.lucide) {
      lucide.createIcons();
    }
  }, []);
  const updateParam = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const applyScenario = scenarioKey => {
    setActiveScenario(scenarioKey);
    const scenario = SCENARIOS[scenarioKey];
    setParams({
      virtualGrowthMult: scenario.virtualGrowthMult,
      microGrowthMult: scenario.microGrowthMult,
      midSizedGrowthMult: scenario.midSizedGrowthMult,
      flagshipCapex: scenario.flagshipCapex,
      ebitdaMultiple: scenario.ebitdaMultiple,
      costInflation: scenario.costInflation
    });
  };

  // Calculate model
  const model = useMemo(() => calculateModel(params, BASE_TRAJECTORIES), [params]);

  // Run Monte Carlo
  const handleRunMonteCarlo = () => {
    setIsRunningMC(true);
    setTimeout(() => {
      const results = runMonteCarlo(params, BASE_TRAJECTORIES, 500);
      setMonteCarloResults(results);
      setIsRunningMC(false);
    }, 100);
  };

  // Sensitivity data
  const sensitivityData = useMemo(() => {
    return {
      growth: runSensitivity(params, BASE_TRAJECTORIES, 'midSizedGrowthMult', [0.5, 1.5]),
      multiple: runSensitivity(params, BASE_TRAJECTORIES, 'ebitdaMultiple', [0.5, 1.5])
    };
  }, [params]);

  // Chart data transformations
  const revenueData = model.years.map(y => ({
    year: y.year,
    Virtual: y.virtualRevenue / 1e6,
    Micro: y.microRevenue / 1e6,
    'Mid-Sized': y.midSizedRevenue / 1e6,
    Flagship: y.flagshipRevenue / 1e6
  }));
  const studentData = model.years.map(y => ({
    year: y.year,
    Virtual: y.virtualStudents,
    Micro: y.microStudents,
    'Mid-Sized': y.midSizedStudents,
    Flagship: y.flagshipStudents
  }));
  const cashFlowData = model.years.map(y => ({
    year: y.year,
    EBITDA: y.totalEBITDA / 1e6,
    CapEx: -y.totalCapex / 1e6,
    'Net Cash Flow': y.netCashFlow / 1e6,
    Cumulative: y.cumulativeCashFlow / 1e6
  }));
  const marginData = model.years.map(y => ({
    year: y.year,
    'EBITDA Margin': y.ebitdaMargin * 100,
    'Timeback %': y.timebackPct * 100
  }));
  const revenueMix = [{
    name: 'Virtual',
    value: model.summary.totalRevenue > 0 ? model.years[10].virtualRevenue : 0,
    color: COLORS.virtual
  }, {
    name: 'Micro',
    value: model.years[10].microRevenue,
    color: COLORS.micro
  }, {
    name: 'Mid-Sized',
    value: model.years[10].midSizedRevenue,
    color: COLORS.midSized
  }, {
    name: 'Flagship',
    value: model.years[10].flagshipRevenue,
    color: COLORS.flagship
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-6"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-bold text-gray-900 mb-2"
  }, "TSA / Strata Financial Model"), /*#__PURE__*/React.createElement("p", {
    className: "text-gray-600"
  }, "Interactive 10-year scenario modeling and analysis")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl shadow-sm border p-4 mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-medium text-gray-700"
  }, "Scenario:"), Object.entries(SCENARIOS).map(([key, scenario]) => /*#__PURE__*/React.createElement(ScenarioButton, {
    key: key,
    scenario: scenario,
    isActive: activeScenario === key,
    onClick: () => applyScenario(key)
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAdvanced(!showAdvanced),
    className: "ml-auto flex items-center gap-2 text-gray-600 hover:text-gray-900"
  }, "Custom Parameters", /*#__PURE__*/React.createElement(Icon, {
    name: showAdvanced ? 'chevron-up' : 'chevron-down',
    size: 18
  }))), showAdvanced && /*#__PURE__*/React.createElement("div", {
    className: "mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-medium text-gray-900 mb-4"
  }, "Growth Multipliers"), /*#__PURE__*/React.createElement(SliderInput, {
    label: "Virtual Schools Growth",
    value: params.virtualGrowthMult,
    onChange: v => updateParam('virtualGrowthMult', v),
    min: 0.5,
    max: 1.5,
    format: "percent"
  }), /*#__PURE__*/React.createElement(SliderInput, {
    label: "Microschools Growth",
    value: params.microGrowthMult,
    onChange: v => updateParam('microGrowthMult', v),
    min: 0.5,
    max: 1.5,
    format: "percent"
  }), /*#__PURE__*/React.createElement(SliderInput, {
    label: "Mid-Sized Growth",
    value: params.midSizedGrowthMult,
    onChange: v => updateParam('midSizedGrowthMult', v),
    min: 0.3,
    max: 1.5,
    format: "percent"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-medium text-gray-900 mb-4"
  }, "Capital & Costs"), /*#__PURE__*/React.createElement(SliderInput, {
    label: "Flagship CapEx",
    value: params.flagshipCapex,
    onChange: v => updateParam('flagshipCapex', v),
    min: 50000000,
    max: 200000000,
    step: 5000000,
    format: "currency"
  }), /*#__PURE__*/React.createElement(SliderInput, {
    label: "Cost Inflation",
    value: params.costInflation,
    onChange: v => updateParam('costInflation', v),
    min: 0.8,
    max: 1.3,
    format: "percent"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-medium text-gray-900 mb-4"
  }, "Valuation"), /*#__PURE__*/React.createElement(SliderInput, {
    label: "EBITDA Multiple",
    value: params.ebitdaMultiple,
    onChange: v => updateParam('ebitdaMultiple', v),
    min: 8,
    max: 25,
    step: 0.5,
    format: "multiple"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-6"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleRunMonteCarlo,
    disabled: isRunningMC,
    className: "w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shuffle",
    size: 18
  }), isRunningMC ? 'Running...' : 'Run Monte Carlo (500 sims)'))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
  }, /*#__PURE__*/React.createElement(MetricCard, {
    title: "Year 10 Students",
    value: formatNumber(model.summary.totalStudents, true),
    subValue: "Target: 500K",
    icon: "users",
    color: "blue"
  }), /*#__PURE__*/React.createElement(MetricCard, {
    title: "Year 10 Revenue",
    value: formatCurrency(model.summary.totalRevenue, true),
    subValue: `${(model.summary.ebitdaMargin * 100).toFixed(1)}% margin`,
    icon: "dollar-sign",
    color: "green"
  }), /*#__PURE__*/React.createElement(MetricCard, {
    title: "Year 10 EBITDA",
    value: formatCurrency(model.summary.totalEBITDA, true),
    icon: "trending-up",
    color: "amber"
  }), /*#__PURE__*/React.createElement(MetricCard, {
    title: "Terminal Value",
    value: formatCurrency(model.summary.terminalValue, true),
    subValue: `${params.ebitdaMultiple}x EBITDA + Property`,
    icon: "target",
    color: "purple"
  }), /*#__PURE__*/React.createElement(MetricCard, {
    title: "Peak Funding Need",
    value: formatCurrency(model.summary.peakFunding, true),
    subValue: model.summary.breakeven > 0 ? `Breakeven: ${YEARS[model.summary.breakeven]}` : 'Cash positive',
    icon: "zap",
    color: "red"
  })), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl shadow-sm border mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex border-b px-4 overflow-x-auto"
  }, /*#__PURE__*/React.createElement(TabButton, {
    isActive: activeTab === 'overview',
    onClick: () => setActiveTab('overview')
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bar-chart-3",
    size: 16
  }), " Overview")), /*#__PURE__*/React.createElement(TabButton, {
    isActive: activeTab === 'revenue',
    onClick: () => setActiveTab('revenue')
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "dollar-sign",
    size: 16
  }), " Revenue")), /*#__PURE__*/React.createElement(TabButton, {
    isActive: activeTab === 'cashflow',
    onClick: () => setActiveTab('cashflow')
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "activity",
    size: 16
  }), " Cash Flow")), /*#__PURE__*/React.createElement(TabButton, {
    isActive: activeTab === 'uniteconomics',
    onClick: () => setActiveTab('uniteconomics')
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calculator",
    size: 16
  }), " Unit Economics")), /*#__PURE__*/React.createElement(TabButton, {
    isActive: activeTab === 'goalseek',
    onClick: () => setActiveTab('goalseek')
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "target",
    size: 16
  }), " Goal Seek")), /*#__PURE__*/React.createElement(TabButton, {
    isActive: activeTab === 'sensitivity',
    onClick: () => setActiveTab('sensitivity')
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shuffle",
    size: 16
  }), " Sensitivity")), /*#__PURE__*/React.createElement(TabButton, {
    isActive: activeTab === 'data',
    onClick: () => setActiveTab('data')
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "table",
    size: 16
  }), " Data Tables"))), /*#__PURE__*/React.createElement("div", {
    className: "p-6"
  }, activeTab === 'overview' && /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Student Enrollment by Tier"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 300
  }, /*#__PURE__*/React.createElement(AreaChart, {
    data: studentData
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "year",
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    tickFormatter: v => formatNumber(v, true),
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: v => formatNumber(v)
  }), /*#__PURE__*/React.createElement(Legend, null), /*#__PURE__*/React.createElement(Area, {
    type: "monotone",
    dataKey: "Virtual",
    stackId: "1",
    fill: COLORS.virtual,
    stroke: COLORS.virtual
  }), /*#__PURE__*/React.createElement(Area, {
    type: "monotone",
    dataKey: "Micro",
    stackId: "1",
    fill: COLORS.micro,
    stroke: COLORS.micro
  }), /*#__PURE__*/React.createElement(Area, {
    type: "monotone",
    dataKey: "Mid-Sized",
    stackId: "1",
    fill: COLORS.midSized,
    stroke: COLORS.midSized
  }), /*#__PURE__*/React.createElement(Area, {
    type: "monotone",
    dataKey: "Flagship",
    stackId: "1",
    fill: COLORS.flagship,
    stroke: COLORS.flagship
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Year 10 Revenue Mix"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 300
  }, /*#__PURE__*/React.createElement(PieChart, null, /*#__PURE__*/React.createElement(Pie, {
    data: revenueMix,
    cx: "50%",
    cy: "50%",
    innerRadius: 60,
    outerRadius: 100,
    paddingAngle: 2,
    dataKey: "value",
    label: ({
      name,
      percent
    }) => `${name}: ${(percent * 100).toFixed(0)}%`
  }, revenueMix.map((entry, index) => /*#__PURE__*/React.createElement(Cell, {
    key: `cell-${index}`,
    fill: entry.color
  }))), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: v => formatCurrency(v, true)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Margin Progression"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 250
  }, /*#__PURE__*/React.createElement(LineChart, {
    data: marginData
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "year",
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    tickFormatter: v => `${v.toFixed(0)}%`,
    tick: {
      fontSize: 12
    },
    domain: [0, 40]
  }), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: v => `${v.toFixed(1)}%`
  }), /*#__PURE__*/React.createElement(Legend, null), /*#__PURE__*/React.createElement(Line, {
    type: "monotone",
    dataKey: "EBITDA Margin",
    stroke: COLORS.ebitda,
    strokeWidth: 2,
    dot: false
  }), /*#__PURE__*/React.createElement(Line, {
    type: "monotone",
    dataKey: "Timeback %",
    stroke: COLORS.timeback,
    strokeWidth: 2,
    dot: false
  }), /*#__PURE__*/React.createElement(ReferenceLine, {
    y: 20,
    stroke: "#9CA3AF",
    strokeDasharray: "5 5",
    label: {
      value: '20% Target',
      position: 'right',
      fontSize: 10
    }
  }))))), activeTab === 'revenue' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Revenue by Tier ($M)"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 400
  }, /*#__PURE__*/React.createElement(AreaChart, {
    data: revenueData
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "year",
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    tickFormatter: v => `$${v.toFixed(0)}M`,
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: v => formatCurrency(v * 1e6, true)
  }), /*#__PURE__*/React.createElement(Legend, null), /*#__PURE__*/React.createElement(Area, {
    type: "monotone",
    dataKey: "Virtual",
    stackId: "1",
    fill: COLORS.virtual,
    stroke: COLORS.virtual
  }), /*#__PURE__*/React.createElement(Area, {
    type: "monotone",
    dataKey: "Micro",
    stackId: "1",
    fill: COLORS.micro,
    stroke: COLORS.micro
  }), /*#__PURE__*/React.createElement(Area, {
    type: "monotone",
    dataKey: "Mid-Sized",
    stackId: "1",
    fill: COLORS.midSized,
    stroke: COLORS.midSized
  }), /*#__PURE__*/React.createElement(Area, {
    type: "monotone",
    dataKey: "Flagship",
    stackId: "1",
    fill: COLORS.flagship,
    stroke: COLORS.flagship
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-sm"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "border-b"
  }, /*#__PURE__*/React.createElement("th", {
    className: "text-left py-2 font-medium text-gray-600"
  }, "Year"), /*#__PURE__*/React.createElement("th", {
    className: "text-right py-2 font-medium text-gray-600"
  }, "Virtual"), /*#__PURE__*/React.createElement("th", {
    className: "text-right py-2 font-medium text-gray-600"
  }, "Micro"), /*#__PURE__*/React.createElement("th", {
    className: "text-right py-2 font-medium text-gray-600"
  }, "Mid-Sized"), /*#__PURE__*/React.createElement("th", {
    className: "text-right py-2 font-medium text-gray-600"
  }, "Flagship"), /*#__PURE__*/React.createElement("th", {
    className: "text-right py-2 font-medium text-gray-900"
  }, "Total"))), /*#__PURE__*/React.createElement("tbody", null, model.years.map(y => /*#__PURE__*/React.createElement("tr", {
    key: y.year,
    className: "border-b hover:bg-gray-50"
  }, /*#__PURE__*/React.createElement("td", {
    className: "py-2 font-medium"
  }, y.year), /*#__PURE__*/React.createElement("td", {
    className: "text-right text-blue-600"
  }, formatCurrency(y.virtualRevenue, true)), /*#__PURE__*/React.createElement("td", {
    className: "text-right text-emerald-600"
  }, formatCurrency(y.microRevenue, true)), /*#__PURE__*/React.createElement("td", {
    className: "text-right text-amber-600"
  }, formatCurrency(y.midSizedRevenue, true)), /*#__PURE__*/React.createElement("td", {
    className: "text-right text-purple-600"
  }, formatCurrency(y.flagshipRevenue, true)), /*#__PURE__*/React.createElement("td", {
    className: "text-right font-bold"
  }, formatCurrency(y.totalRevenue, true)))))))), activeTab === 'cashflow' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Cash Flow Waterfall ($M)"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 400
  }, /*#__PURE__*/React.createElement(ComposedChart, {
    data: cashFlowData
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "year",
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    tickFormatter: v => `$${v.toFixed(0)}M`,
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: v => formatCurrency(v * 1e6, true)
  }), /*#__PURE__*/React.createElement(Legend, null), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "EBITDA",
    fill: COLORS.ebitda
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "CapEx",
    fill: COLORS.capex
  }), /*#__PURE__*/React.createElement(Line, {
    type: "monotone",
    dataKey: "Cumulative",
    stroke: "#1F2937",
    strokeWidth: 2,
    dot: {
      fill: '#1F2937'
    }
  }), /*#__PURE__*/React.createElement(ReferenceLine, {
    y: 0,
    stroke: "#9CA3AF"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-gray-50 rounded-lg p-4"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-medium text-gray-700 mb-2"
  }, "Cumulative CapEx"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-bold text-gray-900"
  }, formatCurrency(model.summary.cumulativeCapex, true))), /*#__PURE__*/React.createElement("div", {
    className: "bg-red-50 rounded-lg p-4"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-medium text-red-700 mb-2"
  }, "Peak Funding Requirement"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-bold text-red-900"
  }, formatCurrency(model.summary.peakFunding, true))), /*#__PURE__*/React.createElement("div", {
    className: "bg-green-50 rounded-lg p-4"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-medium text-green-700 mb-2"
  }, "Breakeven Year"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-bold text-green-900"
  }, model.summary.breakeven > 0 ? YEARS[model.summary.breakeven] : 'N/A')))), activeTab === 'uniteconomics' && /*#__PURE__*/React.createElement(UnitEconomicsPanel, {
    model: model
  }), activeTab === 'goalseek' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement(GoalSeekPanel, {
    params: params,
    onApplyResult: (param, value) => updateParam(param, value)
  }), /*#__PURE__*/React.createElement(ValueCreationWaterfall, {
    model: model,
    params: params
  })), activeTab === 'sensitivity' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Terminal Value vs Mid-Sized Growth"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 300
  }, /*#__PURE__*/React.createElement(LineChart, {
    data: sensitivityData.growth
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "multiplier",
    tickFormatter: v => `${(v * 100).toFixed(0)}%`,
    tick: {
      fontSize: 12
    },
    label: {
      value: 'Growth Rate',
      position: 'bottom',
      offset: -5
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    tickFormatter: v => formatCurrency(v, true),
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: v => formatCurrency(v, true),
    labelFormatter: v => `Growth: ${(v * 100).toFixed(0)}%`
  }), /*#__PURE__*/React.createElement(Line, {
    type: "monotone",
    dataKey: "terminalValue",
    stroke: COLORS.flagship,
    strokeWidth: 2,
    dot: {
      fill: COLORS.flagship
    },
    name: "Terminal Value"
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Terminal Value vs EBITDA Multiple"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 300
  }, /*#__PURE__*/React.createElement(LineChart, {
    data: sensitivityData.multiple
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "multiplier",
    tickFormatter: v => `${(v * params.ebitdaMultiple).toFixed(1)}x`,
    tick: {
      fontSize: 12
    },
    label: {
      value: 'EBITDA Multiple',
      position: 'bottom',
      offset: -5
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    tickFormatter: v => formatCurrency(v, true),
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: v => formatCurrency(v, true),
    labelFormatter: v => `Multiple: ${(v * params.ebitdaMultiple).toFixed(1)}x`
  }), /*#__PURE__*/React.createElement(Line, {
    type: "monotone",
    dataKey: "terminalValue",
    stroke: COLORS.virtual,
    strokeWidth: 2,
    dot: {
      fill: COLORS.virtual
    },
    name: "Terminal Value"
  }))))), monteCarloResults && /*#__PURE__*/React.createElement("div", {
    className: "mt-8 pt-6 border-t"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-gray-900 mb-4"
  }, "Monte Carlo Simulation Results (500 iterations)"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 md:grid-cols-5 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-red-50 rounded-lg p-4 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-red-700 mb-1"
  }, "P10 (Pessimistic)"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-red-900"
  }, formatCurrency(monteCarloResults.p10.terminalValue, true))), /*#__PURE__*/React.createElement("div", {
    className: "bg-amber-50 rounded-lg p-4 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-amber-700 mb-1"
  }, "P25"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-amber-900"
  }, formatCurrency(monteCarloResults.p25.terminalValue, true))), /*#__PURE__*/React.createElement("div", {
    className: "bg-green-50 rounded-lg p-4 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-green-700 mb-1"
  }, "P50 (Median)"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-green-900"
  }, formatCurrency(monteCarloResults.p50.terminalValue, true))), /*#__PURE__*/React.createElement("div", {
    className: "bg-blue-50 rounded-lg p-4 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-blue-700 mb-1"
  }, "P75"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-blue-900"
  }, formatCurrency(monteCarloResults.p75.terminalValue, true))), /*#__PURE__*/React.createElement("div", {
    className: "bg-purple-50 rounded-lg p-4 text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-purple-700 mb-1"
  }, "P90 (Optimistic)"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-purple-900"
  }, formatCurrency(monteCarloResults.p90.terminalValue, true)))), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 p-4 bg-gray-50 rounded-lg"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, /*#__PURE__*/React.createElement("strong", null, "Expected Value:"), " ", formatCurrency(monteCarloResults.mean.terminalValue, true), " |", /*#__PURE__*/React.createElement("strong", {
    className: "ml-4"
  }, "Range:"), " ", formatCurrency(monteCarloResults.p10.terminalValue, true), " to ", formatCurrency(monteCarloResults.p90.terminalValue, true))))), activeTab === 'data' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mb-6 flex-wrap"
  }, ['students', 'revenue', 'ebitda', 'cashflow'].map(view => /*#__PURE__*/React.createElement("button", {
    key: view,
    onClick: () => setDataTableView(view),
    className: `px-4 py-2 rounded-lg font-medium transition-all ${dataTableView === view ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
  }, view.charAt(0).toUpperCase() + view.slice(1))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const csv = model.years.map(y => Object.values(y).join(',')).join('\n');
      const blob = new Blob([csv], {
        type: 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tsa_model_data.csv';
      a.click();
    },
    className: "ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 18
  }), "Export CSV")), /*#__PURE__*/React.createElement(DataTableView, {
    model: model,
    viewMode: dataTableView
  })))), /*#__PURE__*/React.createElement("div", {
    className: "text-center text-sm text-gray-500 mt-8"
  }, /*#__PURE__*/React.createElement("p", null, "TSA Financial Scenario Model \u2022 Built with React & Recharts"))));
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(TSAScenarioModel, null));
