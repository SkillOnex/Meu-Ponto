
import { View, ScrollView, Pressable, Text, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { deleteAllCards, deleteTable } from '../../data/database'; // Atualize a função conforme necessário
import { useRouter } from 'expo-router';

const statusBarHeight = Constants.statusBarHeight;


export default function AllItemsScreen() {


  const router = useRouter();
  const handlePressPage = () => {
    router.replace('/');
  };



  // Deleta todos os cartões e atualiza a lista
  const handleDeleteAllCards = async () => {
    try {
      await deleteAllCards();

    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
    }

  };


  const handlePress = () => {
    Alert.alert(
      'Atenção',
      'Isso apagará todos os seus Dados Salvos, Tem certeza dessa ação?',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim',
          onPress: handleDeleteTable, // Chama a função de permissão ao pressionar 'Sim'
        },
      ],
      { cancelable: false }
    );

  }

  const handleDeleteTable = async () => {

    try {
      await deleteTable();
      Alert.alert(
        'Atenção',
        'Pontos Excluídos',
        [    
          {
            text: 'Fechar',
         
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
    }

  };



  return (
    <View style={{ backgroundColor: "#18191E" }} className="flex-1 bg-slate-200">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="w-full mt-4 " style={{ marginTop: statusBarHeight + 8 }}>

          <View style={{backgroundColor:"#1F222B"}} className="w-full mt-5  bg-white border border-gray-600 rounded-lg shadow ">
            <View className="flex flex-col justify-center items-center pb-10">
              <Image className="w-28 h-28 mb-3 rounded-full mt-5 shadow-lg" source={require("../../assets/icon.png")} />
              <Text className="mb-1 text-xl font-medium text-gray-900 dark:text-white">Meu Ponto</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Versão 1.0.0</Text>
              <View className="flex-row mt-4 md:mt-6">
                <Pressable onPress={handlePress}>
                  <Text className=" items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg ">Apagar Registros</Text>
                </Pressable>
              </View>
            </View>
          </View>


          <View className='w-full p-6 mt-5 bg-[#1F222B] border border-gray-600 rounded-lg shadow '>

            <Text className='text-center font-light text-zinc-200'>Obrigado por usar!</Text>

          </View>


        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-transparent">
        <View className="items-center">
          <Pressable
            onPress={handlePressPage}
            className="w-72 text-gray-900 bg-[#1F222B]  font-medium rounded-full text-sm px-5 py-2.5 mb-2"
          >
            <View className='flex-row justify-between items-center'>
              <Feather name='arrow-left' size={30} color="#ffff" />
              <Text className="text-white text-center text-2xl font-light">Voltar</Text>
              <Text> ㅤㅤ</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
