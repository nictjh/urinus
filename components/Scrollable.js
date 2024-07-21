import React, { useState, useRef } from 'react';
import { Dimensions, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import CardWAction from "./CardWAction";
import ToiletInfoCard from './ToiletInfoCard';

// const data = [...new Array(6).keys()];
const width = Dimensions.get("window").width;

const Scrollable = ({ toilets }) => {

    const [mode, setMode] = useState("horizontal-stack");
    const [snapDirection, setSnapDirection] = useState("left");
    const [pagingEnabled, setPagingEnabled] = useState(true);
    const [snapEnabled, setSnapEnabled] = useState(true);
    const [loop, setLoop] = useState(true);
    const [autoPlay, setAutoPlay] = useState(true);
    const [autoPlayReverse, setAutoPlayReverse] = useState(false);

    // const data = useRef([...new Array(6).keys()]).current;
    const viewCount = 5;
    const autoPlayInterval = 3500;

    return (
        <View style={{ flex: 1, marginTop: 20}}>
            <Carousel
                style={{
                    width: "100%",
                    height: 300,
                    alignItems: "center",
                    justifyContent: "center",
                }}
                width={400}
                height={300}
                pagingEnabled={pagingEnabled}
                snapEnabled={snapEnabled}
                mode={mode}
                loop={loop}
                autoPlay={autoPlay}
                autoPlayReverse={autoPlayReverse}
                autoPlayInterval={autoPlayInterval}
                modeConfig={{
                    snapDirection,
                    stackInterval: mode === "vertical-stack" ? 8 : 18,
                }}
                customConfig={() => ({ type: "positive", viewCount })}
                data={toilets}
                renderItem={({ item }) => (
                    <ToiletInfoCard toilet={item}/>
                )}
            />
        </View>
    )
}

export default Scrollable;