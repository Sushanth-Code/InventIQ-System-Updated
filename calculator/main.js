const sellingPriceInput = document.querySelector(".selling-price");
const costInput = document.querySelector(".cost");

const revenueValue = document.querySelector(".revenue .value");
const leftCostValue = document.querySelector(".left-cost .value");
const listingFeeValue = document.querySelector(".listing-fee .value");
const transactionFeeValue = document.querySelector(".transaction-fee .value");
const processingFeeValue = document.querySelector(".processing-fee .value");
const totalCostValue = document.querySelector(".total-cost .value");
const profitValue = document.querySelector(".profit .value");

const calculateBtn = document.querySelector(".calculate-btn");

let sellingPrice = parseFloat(sellingPriceInput.value);
let cost = parseFloat(costInput.value);

let myChart;

const displayChart = (profit, leftCost)=>{
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['profit', 'cost'],
        datasets: [{
            data: [profit, leftCost],
            backgroundColor: ["#e63946", "#14213d"],
            borderWidth: 0,
        }]
    },
});
};

const updateChart = (profit, leftCost) => {
    myChart.data.datasets[0].data[0] = profit;
    myChart.data.datasets[0].data[1] = leftCost;
    myChart.update();
}

const updateData = () => {
    let revenue = sellingPrice;
    revenueValue.innerHTML = revenue;

    let leftCost = cost;
    leftCostValue.innerHTML = leftCost;

    let listingFee = 20;
    listingFeeValue.innerHTML = listingFee;

    let transactionFee = (1.8 * sellingPrice) / 100;
    transactionFeeValue.innerHTML = transactionFee.toFixed(2);

    let processingFee = (4 * sellingPrice) / 100;
    processingFeeValue.innerHTML = processingFee;

    let totalCost = leftCost + listingFee + transactionFee + processingFee;
    totalCostValue.innerHTML = totalCost;

    let profit = (revenue - totalCost);
    profitValue.innerHTML = profit.toFixed(2);

    if(myChart) {
        updateChart(profit, leftCost);
    }
    else{
        displayChart(profit, leftCost);
    }
}

// const init = ()=>{
//     updateData();
// }
// init();

const refreshInputValues = ()=>{
    sellingPrice = parseFloat(sellingPriceInput.value);
    cost = parseFloat(costInput.value);
}

calculateBtn.addEventListener("click", ()=>{
    refreshInputValues()
    updateData();
})


  