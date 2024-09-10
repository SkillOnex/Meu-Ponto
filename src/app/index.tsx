import { View, ScrollView } from "react-native";


import Constants from 'expo-constants';
import { Header } from "../components/header";
import { Banner } from "../components/banner";
import { Main } from "../components/main";


const statusBarHeight = Constants.statusBarHeight;

export default function Index() {
  
  return (
    
    <ScrollView style={{ flex: 1 , backgroundColor: "#18191E"} }  showsVerticalScrollIndicator={false}>

      <View className="w-full px-4" style={{marginTop:statusBarHeight + 8}}>
        
        <Header/>
        <Banner/>
        
        <Main/>
        

      </View>
      
    </ScrollView>
  );
}
