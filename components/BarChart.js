import React from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const BarChartComponent = ({ data, width }) => {
    const chartConfig = {
        backgroundColor: "#FFFFFF",
        backgroundGradientFrom: "#FFFFFF",
        backgroundGradientTo: "#FFFFFF",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        barPercentage: 0.7,
        fillShadowGradient: 'rgba(0, 0, 255, 1)',
        fillShadowGradientOpacity: 1,
        propsForLabels: {
        fontSize: 10
    },
    };

    return (
        <View>
            <BarChart
                data={data}
                width={width}
                height={220}
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                showValuesOnTopOfBars={true}
                fromZero={true}
            />
        </View>
    );
};

export default BarChartComponent