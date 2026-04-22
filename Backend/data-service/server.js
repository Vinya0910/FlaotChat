const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
// NOAA OCEAN MAPPING
const oceanToStation ={
atlantic :"9414290",
pacific :"9414290",
indian: "9414290",
southern:"9414290",
arctic:"9414290"
};

const formatChartData =(data)=>{
return{
labels:data.map(d=>d.t),
values:data.map(d=>parseFloat(d.v))
};
};

app.get("/data",async (req ,res)=>{
try{
let{ocean ="atlantic"} =req.query;
ocean = ocean.toLowerCase();
const station = oceanToStation[ocean];
if(!station){
return res.status(400).json({error:"Invalid ocean"});
}
const response = await axios.get("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter",
{
params:{
product :"water_temperature",
station,
time_zone:"gmt",
units:"metric",
format:"json",
begin_date:"20240101",
end_date:"20240102"
}
}

);
const rawData = response.data.data.slice(0,50);
const chartData = formatChartData(rawData);
res.json({
ocean,
chartData
});
}
catch(err){
res.status(500).json({
error:err.message
});
}
});
app.listen(5001,()=>{
console.log("Server running");
})