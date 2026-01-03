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
    fillRateYr2: 1.0
  },
  midSized: {
    tuition: 25000,
    timeback: 5000,
    studentsRenovated: 400,
    studentsNewBuild: 1000,
    purchaseRenovated: 1000000,
    capexRenovated: 14000000,
    purchaseNewBuild: 10000000,
    capexNewBuild: 40000000,
    blendRatio: 0.5,
    tofMarketing: 1000,
    bofMarketing: 4000,
    fillRates: [0, 0.33, 0.67, 1.0]
  },
  flagship: {
    tuition: 50000,
    timeback: 10000,
    studentsPerSchool: 1500,
    tofMarketing: 2000,
    bofMarketing: 8000,
    fillRates: [0, 0, 0.33, 0.67, 1.0]
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
    const virtualEBITDA = virtualRevenue - virtualExpenses;

    // Microschools
    const microSchools = Math.round(trajectories.microSchools[i] * params.microGrowthMult);
    const newMicroSchools = Math.max(0, microSchools - prevMicroSchools);
    const existingMicroSchools = prevMicroSchools;
    const microStudents = Math.round(existingMicroSchools * BASE_ASSUMPTIONS.micro.studentsPerSchool + newMicroSchools * BASE_ASSUMPTIONS.micro.fillRateYr1 * BASE_ASSUMPTIONS.micro.studentsPerSchool);
    const microRevenue = microStudents * BASE_ASSUMPTIONS.micro.tuition;
    const microExpenses = microStudents * (BASE_ASSUMPTIONS.micro.coachSalary + BASE_ASSUMPTIONS.micro.realEstate + BASE_ASSUMPTIONS.micro.lifeSkills + BASE_ASSUMPTIONS.micro.misc + BASE_ASSUMPTIONS.micro.timeback) * params.costInflation;
    const microTimeback = microStudents * BASE_ASSUMPTIONS.micro.timeback;
    const microNewStudents = Math.round(newMicroSchools * BASE_ASSUMPTIONS.micro.fillRateYr1 * BASE_ASSUMPTIONS.micro.studentsPerSchool);
    const microMarketing = microNewStudents * (BASE_ASSUMPTIONS.micro.tofMarketing + BASE_ASSUMPTIONS.micro.bofMarketing);
    const microEBITDA = microRevenue - microExpenses - microMarketing;
    prevMicroSchools = microSchools;

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
      midSizedStudents += studentsPerMidSized * fillRate;
    });
    midSizedStudents = Math.round(midSizedStudents);
    const midSizedTuition = BASE_ASSUMPTIONS.midSized.tuition;
    const midSizedRevenue = midSizedStudents * midSizedTuition;
    const midSizedTimeback = midSizedStudents * BASE_ASSUMPTIONS.midSized.timeback;

    // Mid-sized CapEx
    const avgPurchase = BASE_ASSUMPTIONS.midSized.purchaseRenovated * BASE_ASSUMPTIONS.midSized.blendRatio + BASE_ASSUMPTIONS.midSized.purchaseNewBuild * (1 - BASE_ASSUMPTIONS.midSized.blendRatio);
    const avgCapex = BASE_ASSUMPTIONS.midSized.capexRenovated * BASE_ASSUMPTIONS.midSized.blendRatio + BASE_ASSUMPTIONS.midSized.capexNewBuild * (1 - BASE_ASSUMPTIONS.midSized.blendRatio);
    const midSizedCapex = i === 0 ? 25000000 : newMidSized * (avgPurchase + avgCapex);

    // Operating costs (simplified)
    const midSizedOpex = midSizedStudents * 12000 * params.costInflation;
    const midSizedNewStudents = Math.round(newMidSized * studentsPerMidSized * 0.33);
    const midSizedMarketing = midSizedNewStudents * (BASE_ASSUMPTIONS.midSized.tofMarketing + BASE_ASSUMPTIONS.midSized.bofMarketing);
    const midSizedEBITDA = midSizedRevenue - midSizedOpex - midSizedMarketing;
    prevMidSizedSchools = midSizedSchools;

    // Flagship Schools
    const flagshipSchools = trajectories.flagshipSchools[i];
    const newFlagship = Math.max(0, flagshipSchools - prevFlagshipSchools);

    // Update school ages
    flagshipSchoolAges = flagshipSchoolAges.map(age => age + 1);
    for (let j = 0; j < newFlagship; j++) {
      flagshipSchoolAges.push(0);
    }
    let flagshipStudents = 0;
    flagshipSchoolAges.forEach(age => {
      const fillRate = BASE_ASSUMPTIONS.flagship.fillRates[Math.min(age, 4)];
      flagshipStudents += BASE_ASSUMPTIONS.flagship.studentsPerSchool * fillRate;
    });
    flagshipStudents = Math.round(flagshipStudents);
    const flagshipRevenue = flagshipStudents * BASE_ASSUMPTIONS.flagship.tuition;
    const flagshipTimeback = flagshipStudents * BASE_ASSUMPTIONS.flagship.timeback;
    const flagshipCapex = newFlagship * params.flagshipCapex;
    const flagshipOpex = flagshipStudents * 15000 * params.costInflation;
    const flagshipNewStudents = Math.round(newFlagship * BASE_ASSUMPTIONS.flagship.studentsPerSchool * 0.33);
    const flagshipMarketing = flagshipNewStudents * (BASE_ASSUMPTIONS.flagship.tofMarketing + BASE_ASSUMPTIONS.flagship.bofMarketing);
    const flagshipEBITDA = flagshipRevenue - flagshipOpex - flagshipMarketing;
    prevFlagshipSchools = flagshipSchools;

    // Totals
    const totalStudents = virtualStudents + microStudents + midSizedStudents + flagshipStudents;
    const totalRevenue = virtualRevenue + microRevenue + midSizedRevenue + flagshipRevenue;
    const totalTimeback = virtualTimeback + microTimeback + midSizedTimeback + flagshipTimeback;
    const totalEBITDA = virtualEBITDA + microEBITDA + midSizedEBITDA + flagshipEBITDA;
    const totalCapex = midSizedCapex + flagshipCapex;
    const netCashFlow = totalEBITDA - totalCapex;
    years.push({
      year,
      yearIndex: i,
      // Students
      virtualStudents,
      microStudents,
      midSizedStudents,
      flagshipStudents,
      totalStudents,
      // Schools
      microSchools,
      midSizedSchools,
      flagshipSchools,
      // Revenue
      virtualRevenue,
      microRevenue,
      midSizedRevenue,
      flagshipRevenue,
      totalRevenue,
      // EBITDA
      virtualEBITDA,
      microEBITDA,
      midSizedEBITDA,
      flagshipEBITDA,
      totalEBITDA,
      // CapEx
      midSizedCapex,
      flagshipCapex,
      totalCapex,
      // Cash Flow
      netCashFlow,
      // Timeback
      totalTimeback,
      // Margins
      ebitdaMargin: totalRevenue > 0 ? totalEBITDA / totalRevenue : 0,
      timebackPct: totalRevenue > 0 ? totalTimeback / totalRevenue : 0
    });
  }

  // Calculate cumulative values
  let cumulativeCashFlow = 0;
  let cumulativeCapex = 0;
  let minCashFlow = 0;
  years.forEach(year => {
    cumulativeCashFlow += year.netCashFlow;
    cumulativeCapex += year.totalCapex;
    year.cumulativeCashFlow = cumulativeCashFlow;
    year.cumulativeCapex = cumulativeCapex;
    minCashFlow = Math.min(minCashFlow, cumulativeCashFlow);
  });

  // Terminal value
  const finalYear = years[years.length - 1];
  const terminalValue = finalYear.totalEBITDA * params.ebitdaMultiple + cumulativeCapex * 0.8; // 80% of capex as property value

  return {
    years,
    summary: {
      totalStudents: finalYear.totalStudents,
      totalRevenue: finalYear.totalRevenue,
      totalEBITDA: finalYear.totalEBITDA,
      ebitdaMargin: finalYear.ebitdaMargin,
      totalTimeback: finalYear.totalTimeback,
      timebackPct: finalYear.timebackPct,
      cumulativeCapex,
      terminalValue,
      peakFunding: Math.abs(minCashFlow),
      breakeven: years.findIndex(y => y.cumulativeCashFlow > 0)
    }
  };
}

// Monte Carlo simulation
function runMonteCarlo(baseParams, trajectories, iterations = 500) {
  const results = [];
  for (let i = 0; i < iterations; i++) {
    const params = {
      ...baseParams,
      virtualGrowthMult: baseParams.virtualGrowthMult * (0.8 + Math.random() * 0.4),
      microGrowthMult: baseParams.microGrowthMult * (0.7 + Math.random() * 0.6),
      midSizedGrowthMult: baseParams.midSizedGrowthMult * (0.6 + Math.random() * 0.8),
      costInflation: baseParams.costInflation * (0.9 + Math.random() * 0.2),
      ebitdaMultiple: baseParams.ebitdaMultiple * (0.7 + Math.random() * 0.6)
    };
    const model = calculateModel(params, trajectories);
    results.push({
      terminalValue: model.summary.terminalValue,
      totalRevenue: model.summary.totalRevenue,
      totalEBITDA: model.summary.totalEBITDA,
      peakFunding: model.summary.peakFunding
    });
  }
  results.sort((a, b) => a.terminalValue - b.terminalValue);
  return {
    p10: results[Math.floor(iterations * 0.1)],
    p25: results[Math.floor(iterations * 0.25)],
    p50: results[Math.floor(iterations * 0.5)],
    p75: results[Math.floor(iterations * 0.75)],
    p90: results[Math.floor(iterations * 0.9)],
    distribution: results
  };
}

// Sensitivity analysis
function runSensitivity(baseParams, trajectories, variable, range) {
  const results = [];
  for (let mult = range[0]; mult <= range[1]; mult += (range[1] - range[0]) / 10) {
    const params = {
      ...baseParams,
      [variable]: baseParams[variable] * mult
    };
    const model = calculateModel(params, trajectories);
    results.push({
      multiplier: mult,
      terminalValue: model.summary.terminalValue,
      totalEBITDA: model.summary.totalEBITDA
    });
  }
  return results;
}

// Simple Icon components using Lucide
const Icon = ({
  name,
  size = 18,
  className = ''
}) => {
  const iconRef = useRef(null);
  useEffect(() => {
    if (iconRef.current && window.lucide) {
      lucide.createIcons({
        icons: {
          [name]: lucide[name]
        },
        nameAttr: 'data-lucide'
      });
    }
  }, [name]);
  return React.createElement('i', {
    ref: iconRef,
    'data-lucide': name,
    className,
    style: {
      width: size,
      height: size
    }
  });
};

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
function TSAScenarioModel() {
  const [activeScenario, setActiveScenario] = useState('base');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [monteCarloResults, setMonteCarloResults] = useState(null);
  const [isRunningMC, setIsRunningMC] = useState(false);

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
    className: "flex border-b px-4"
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
    isActive: activeTab === 'sensitivity',
    onClick: () => setActiveTab('sensitivity')
  }, /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shuffle",
    size: 16
  }), " Sensitivity"))), /*#__PURE__*/React.createElement("div", {
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
  }, model.summary.breakeven > 0 ? YEARS[model.summary.breakeven] : 'N/A')))), activeTab === 'sensitivity' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
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
    className: "mt-4"
  }, /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 200
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: [{
      name: 'P10',
      value: monteCarloResults.p10.terminalValue / 1e9
    }, {
      name: 'P25',
      value: monteCarloResults.p25.terminalValue / 1e9
    }, {
      name: 'P50',
      value: monteCarloResults.p50.terminalValue / 1e9
    }, {
      name: 'P75',
      value: monteCarloResults.p75.terminalValue / 1e9
    }, {
      name: 'P90',
      value: monteCarloResults.p90.terminalValue / 1e9
    }]
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    stroke: "#E5E7EB"
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "name",
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    tickFormatter: v => `$${v.toFixed(0)}B`,
    tick: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: v => `$${v.toFixed(1)}B`
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "value",
    fill: "#8B5CF6",
    radius: [4, 4, 0, 0]
  })))))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl shadow-sm border p-6"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAssumptions(!showAssumptions),
    className: "flex items-center gap-2 font-semibold text-gray-900 w-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "building-2",
    size: 20
  }), "Baked-In Assumptions (Reference)", /*#__PURE__*/React.createElement(Icon, {
    name: showAssumptions ? 'chevron-up' : 'chevron-down',
    size: 18,
    className: "ml-auto"
  })), showAssumptions && /*#__PURE__*/React.createElement("div", {
    className: "mt-4 pt-4 border-t"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-4 gap-6 text-sm"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-blue-700 mb-2"
  }, "Virtual Schools"), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-1 text-gray-600"
  }, /*#__PURE__*/React.createElement("li", null, "Tuition: $10,474"), /*#__PURE__*/React.createElement("li", null, "Timeback: $2,000 (19.1%)"), /*#__PURE__*/React.createElement("li", null, "Expenses/Student: $6,750"), /*#__PURE__*/React.createElement("li", null, "ToF Marketing: $500"), /*#__PURE__*/React.createElement("li", null, "BoF Marketing: $2,000"), /*#__PURE__*/React.createElement("li", null, "Target: 100K students"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-emerald-700 mb-2"
  }, "Microschools"), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-1 text-gray-600"
  }, /*#__PURE__*/React.createElement("li", null, "Tuition: $15,000"), /*#__PURE__*/React.createElement("li", null, "Timeback: $3,000 (20%)"), /*#__PURE__*/React.createElement("li", null, "25 students/school"), /*#__PURE__*/React.createElement("li", null, "Fill Rate Yr1: 70%"), /*#__PURE__*/React.createElement("li", null, "ToF: $500 / BoF: $2,500"), /*#__PURE__*/React.createElement("li", null, "Target: 4,000 schools"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-amber-700 mb-2"
  }, "Mid-Sized (SAC)"), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-1 text-gray-600"
  }, /*#__PURE__*/React.createElement("li", null, "Tuition: $25,000"), /*#__PURE__*/React.createElement("li", null, "Timeback: $5,000 (20%)"), /*#__PURE__*/React.createElement("li", null, "Renovated: 400 students, $15M"), /*#__PURE__*/React.createElement("li", null, "Ground-Up: 1000 students, $50M"), /*#__PURE__*/React.createElement("li", null, "50/50 blend"), /*#__PURE__*/React.createElement("li", null, "Fill: 0%\u219233%\u219267%\u2192100%"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-purple-700 mb-2"
  }, "Flagships"), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-1 text-gray-600"
  }, /*#__PURE__*/React.createElement("li", null, "Tuition: $50,000"), /*#__PURE__*/React.createElement("li", null, "Timeback: $10,000 (20%)"), /*#__PURE__*/React.createElement("li", null, "1,500 students/campus"), /*#__PURE__*/React.createElement("li", null, "4 total campuses"), /*#__PURE__*/React.createElement("li", null, "Fill: 0%\u21920%\u219233%\u219267%\u2192100%"), /*#__PURE__*/React.createElement("li", null, "CapEx: $75-150M (adjustable)")))))), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 text-center text-xs text-gray-500"
  }, "TSA / Strata Financial Model v1.0 \u2022 Based on December 2024 assumptions")));
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(TSAScenarioModel, null));
