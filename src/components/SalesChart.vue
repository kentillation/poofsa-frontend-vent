<template>
    <v-container>
        <v-select v-model="selectedMonth" :items="monthOptions" item-title="title" item-value="value"
            label="Select Month" class="mb-4" dense outlined style="max-width: 200px;"
            @update:modelValue="handleMonthChange" />
        <Bar v-if="chartData" :data="chartData" :options="chartOptions" style="max-height: 350px;" />
        <!-- <Doughnut v-if="donutData" :data="donutData" :options="donutOptions" style="max-width: 500px; max-height: 350px;" /> -->
        <v-container v-else class="d-flex flex-column align-center text-center mx-auto mt-10" height="350"
            width="100%" rounded>
            <div class="w-100 mt-10 mb-10">
                <v-icon :size="iconSize" icon="mdi-cash-off" class="text-red-darken-2 mb-3"></v-icon>
                <h2 class="text-red-darken-2 mb-3">Sales not found!</h2>
                <p class="text-grey mb-3">Looks like there is no sales data from the selected month.</p>
            </div>
        </v-container>
    </v-container>
</template>

<script>
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
// import { Doughnut } from 'vue-chartjs';
import {
    Chart,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';

Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

export default {
    components: { Bar },
    data () {
        return {
            iconSize: "70px",
        }
    },
    props: {
        salesByMonth: {
            type: Array,
            required: true,
        },
    },

    setup(props, { emit }) {
        const monthOptions = [
            { title: 'January', value: 0 },
            { title: 'February', value: 1 },
            { title: 'March', value: 2 },
            { title: 'April', value: 3 },
            { title: 'May', value: 4 },
            { title: 'June', value: 5 },
            { title: 'July', value: 6 },
            { title: 'August', value: 7 },
            { title: 'September', value: 8 },
            { title: 'October', value: 9 },
            { title: 'November', value: 10 },
            { title: 'December', value: 11 },
        ];

        const selectedMonth = ref(new Date().getMonth());

        const handleMonthChange = (monthIndex) => {
            const month = monthIndex + 1;
            emit('month-changed', month);
            emit('sales-changed', month); // added
            emit('orders-changed', month); // added
        };

        const filteredSalesByMonth = computed(() => {
            return props.salesByMonth.filter(sale => {
                const date = new Date(sale.updated_at);
                return date.getMonth() === selectedMonth.value;
            });
        });

        const chartData = computed(() => {
            if (!filteredSalesByMonth.value.length) return null;
            const year = new Date(filteredSalesByMonth.value[0].updated_at).getFullYear();
            const daysInMonth = new Date(year, selectedMonth.value + 1, 0).getDate();
            const salesPerDay = Array(daysInMonth).fill(0);
            filteredSalesByMonth.value.forEach(sale => {
                const date = new Date(sale.updated_at);
                const day = date.getDate();
                salesPerDay[day - 1] += Number(sale.sales || sale.total_sales || 0);
            });
            const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
            return {
                labels,
                datasets: [
                    {
                        label: 'Sales (₱)',
                        backgroundColor: [
                            '#be43435d', '#be6a4350', '#c27e005b', '#9dbe4357',
                            '#00a1a15d', '#00a1a180',
                        ],
                        borderColor: [
                            '#ff6666', '#ff9a6b', '#ffcc6d', '#a4c251',
                            '#54c587', '#4ab6b6',
                        ],
                        borderWidth: 3,
                        borderRadius: 8,
                        data: salesPerDay,
                    },
                ],
            };
        });

        // Donut Chart Data: total sales per month for the current year
        const donutData = computed(() => {
            if (!props.salesByMonth.length) return null;
            const now = new Date();
            const year = now.getFullYear();
            const salesPerMonth = Array(12).fill(0);
            props.salesByMonth.forEach(sale => {
                const date = new Date(sale.updated_at);
                if (date.getFullYear() === year) {
                    const month = date.getMonth();
                    salesPerMonth[month] += Number(sale.sales || sale.total_sales || 0);
                }
            });
            return {
                labels: monthOptions.map(m => m.title),
                datasets: [
                    {
                        label: 'Sales (₱)',
                        backgroundColor: [
                            '#be43435d', '#be6a4350', '#c27e005b', '#9dbe4357',
                            '#00a1a1', '#4387be62', '#4360be5e', '#4360be',
                            '#5b00c259', '#d34a8e5b', '#c2506359', '#852a2a5b',
                        ],
                        data: salesPerMonth,
                    },
                ],
            };
        });

        const donutOptions = {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'right' },
                tooltip: { enabled: true },
            },
        };

        const chartOptions = {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
            },
            scales: {
                y: { beginAtZero: true },
            },
        };

        return {
            monthOptions,
            selectedMonth,
            chartData,
            chartOptions,
            handleMonthChange,
            donutData,
            donutOptions,
        };
    }
};
</script>