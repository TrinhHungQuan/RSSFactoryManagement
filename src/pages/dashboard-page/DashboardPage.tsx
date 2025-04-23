import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie,
} from "recharts";

// Mock data
const data = [
  {
    team: "Team 1",
    input: 1200,
    check: 800,
    itemFault: 200,
    productionFault: 200,
    totalFault: 400,
  },
  {
    team: "Team 2",
    input: 1200,
    check: 800,
    itemFault: 150,
    productionFault: 100,
    totalFault: 250,
  },
  {
    team: "Team 3",
    input: 1150,
    check: 780,
    itemFault: 130,
    productionFault: 170,
    totalFault: 300,
  },
  {
    team: "Team 4",
    input: 1180,
    check: 790,
    itemFault: 160,
    productionFault: 180,
    totalFault: 340,
  },
  {
    team: "Team 5",
    input: 1220,
    check: 800,
    itemFault: 100,
    productionFault: 150,
    totalFault: 250,
  },
];

const COLORS = ["#6ED4E7", "#3CC57B", "#F97316", "#F9A8D4", "#EF4444"];

const customLabels: { [key: string]: string } = {
  input: "Input($)",
  check: "Check ($)",
  itemFault: "Item Fault ($)",
  productionFault: "Production Fault ($)",
  totalFault: "Total Fault ($)",
  Input: "Input ($)",
  Check: "Check ($)",
  "Item Fault": "Item Fault ($)",
  "Production Fault": "Production Fault ($)",
  "Total Fault": "Total Fault ($)",
};

const pieData = [
  { name: "Input", value: data.reduce((sum, d) => sum + d.input, 0) },
  { name: "Check", value: data.reduce((sum, d) => sum + d.check, 0) },
  { name: "Item Fault", value: data.reduce((sum, d) => sum + d.itemFault, 0) },
  {
    name: "Production Fault",
    value: data.reduce((sum, d) => sum + d.productionFault, 0),
  },
  {
    name: "Total Fault",
    value: data.reduce((sum, d) => sum + d.totalFault, 0),
  },
];

const DashboardPage = () => {
  return (
    <>
      <div className="flex justify-between items-center top-0 ml-6 mr-6 mb-4 mt-[22px] pt-0 pl-0">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-3/5 h-[400px] bg-white p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              data={data}
            >
              <XAxis dataKey="team" />
              <YAxis />
              <Tooltip />
              <Legend
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-5 mt-2">
                    {payload?.map((entry, index) => (
                      <div
                        key={`legend-${index}`}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-5 h-5"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-semibold">
                          {
                            customLabels[
                              entry.value as keyof typeof customLabels
                            ]
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Bar dataKey="input" fill="#6ED4E7" />
              <Bar dataKey="check" fill="#3CC57B" />
              <Bar dataKey="itemFault" fill="#F97316" />
              <Bar dataKey="productionFault" fill="#F9A8D4" />
              <Bar dataKey="totalFault" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full lg:w-2/5 h-[400px] bg-white p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="40%"
                cy="50%"
                outerRadius={100}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value: string) => {
                  const label =
                    customLabels[value as keyof typeof customLabels] || value;
                  return <span style={{ color: "#000000" }}>{label}</span>;
                }}
                wrapperStyle={{
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
