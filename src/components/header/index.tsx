import { View, Pressable, Text, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';

export function Header() {
    const router = useRouter();

    const handlePressPage = () => {
        router.replace('../../views/Options');
    };

    return (
        <View className="w-full flex flex-row items-center justify-between">

            <View className="flex-row justify-center items-center">
                <Image className="w-10 h-10 rounded-full shadow-lg" source={require("../../assets/icon.png")} />
                <Text className="text-lg font-bold text-zinc-200"> Meu Ponto</Text>
            </View> 

            <Pressable style={{ backgroundColor: "#1F222B" }} className="w-10 h-10  rounded-full flex justify-center items-center" onPress={handlePressPage}>
                <Ionicons name="menu" size={20} color="#FEFAF1" />
            </Pressable>




        </View>
    )
}