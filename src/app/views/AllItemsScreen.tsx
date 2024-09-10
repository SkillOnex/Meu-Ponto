import React, { useEffect, useState } from 'react';
import { View, ScrollView, TextInput, Pressable, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { getCards, searchCards } from '../../data/database'; // Atualize a função conforme necessário
import { useRouter } from 'expo-router';

const statusBarHeight = Constants.statusBarHeight;

interface Card {
  id: number;
  company: string;
  hours: string;
  hours_exit: string;
  hours_total: string;
  jornade: string;
  date: string;
  status: string;
  local:string;
}

export default function AllItemsScreen() {
  const [closedCards, setClosedCards] = useState<Card[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false); // Estado de busca

  useEffect(() => {
    const fetchCards = async () => {
      try {
        getCards((fetchedCards) => {
          const closedCards = fetchedCards.filter(card => card.status === 'Fechado');
          setClosedCards(closedCards);
          setLoading(false); // Dados carregados, define o estado como false
        });
      } catch (error) {
        console.error("Erro ao buscar cartões:", error);
        setLoading(false); // Se houver erro, ainda deve parar o carregamento
      }
    };

    fetchCards();
  }, []); // Array de dependências vazio garante que o efeito execute uma vez na montagem

  useEffect(() => {
    if (searchQuery) {
      setSearching(true);
      searchCards(searchQuery, (result: Card[]) => {
        setCards(result);
        setSearching(false);
      });
    } else {
      setCards([]);
    }
  }, [searchQuery]);

  const router = useRouter();
  const handlePressPage = () => {
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={{ backgroundColor: "#1F222B" }} className="flex-1 justify-center items-center ">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-lg text-zinc-200">Carregando...</Text>
      </View>
    );
  }

  const displayCards = searchQuery ? cards : closedCards.sort((a, b) => b.id - a.id);

  return (
    <View style={{ backgroundColor: "#18191E" }} className="flex-1 bg-slate-200">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="w-full mt-4" style={{ marginTop: statusBarHeight + 8 }}>

          <View className="w-full flex-row border border-blue-500 h-14 rounded-full items-center gap-2 px-4 bg-transparent">
            <Feather name="search" size={24} color="#FEFAF1" />
            <TextInput
              style={{ backgroundColor: 'transparent', color: '#ffff' }}

              placeholder="Procure por empresa ou data..."
              placeholderTextColor="gray"
              className="w-full flex-1 h-full bg-transparent text-slate-50 placeholder:text-gray-50"
              value={searchQuery}
              onChangeText={setSearchQuery}

            />
          </View>

          <View className='justify-center items-center'>
            <View className="w-48 h-1 mt-8 bg-gray-400 border-0 rounded-md mb-8" />
          </View>

          <View className="w-full h-full md:h-60 rounded-2xl mb-4">
            {searching ? (
              <View style={{ backgroundColor: "#1F222B" }} className="w-full flex justify-center items-center mb-2 p-6 rounded-lg shadow">
                <Text className="text-slate-600 font-light text-lg">Buscando...</Text>
              </View>
            ) : displayCards.length > 0 ? (
              displayCards
                .map((card, index) => (
                  <View key={index} style={{ backgroundColor: "#1F222B" }} className="w-full mb-2 p-6 pt-7 bg-slate-300 rounded-lg ">
                    <Pressable>
                      <View className="flex-row mb-4">
                        <Feather className="me-2" name='lock' color="#dc2626" size={24} />
                        <Text className="text-2xl font-bold tracking-tight text-red-600">{card.status}</Text>
                      </View>

                      <View className="w-full flex-row items-center mb-2">
                        <Feather className="me-2" name='home' size={18} color="#FEFAF1" />
                        <Text className="font-normal text-zinc-300">Empresa: {card.company}</Text>
                      </View>
                      <View className="w-full flex-row items-center mb-2">
                        <Feather className="me-2" name='map-pin' size={18} color="#FEFAF1" />
                        <Text className="font-normal text-zinc-300">Local: {card.local}</Text>
                      </View>
                      <View className="w-full flex-row items-center mb-2">
                        <Feather className="me-2" name='clock' size={18} color="#FEFAF1"></Feather>
                        <Text className="font-normal text-zinc-300">Entrada: {card.hours} </Text>
                      </View>
                      <View className="w-full flex-row items-center mb-2">
                        <Feather className="me-2" name='log-out' size={18} color="#FEFAF1"></Feather>
                        <Text className="font-normal text-zinc-300">Saida: {card.hours_exit} </Text>
                      </View>
                      <View className="w-full flex-row items-center mb-2">
                        <Feather className="me-2" name='bar-chart-2' size={18} color="#FEFAF1"></Feather>
                        <Text className="font-normal text-zinc-300">Trabalho Total: {card.hours_total}</Text>
                      </View>
                      <View className="w-full flex-row items-center mb-2">
                        <Feather className="me-2" name='calendar' size={18} color="#FEFAF1"></Feather>
                        <Text className="font-normal text-zinc-300">Data: {card.date}</Text>
                      </View>
                    </Pressable>
                  </View>
                ))
            ) : (
              <View style={{ backgroundColor: "#1F222" }} className="w-full flex justify-center items-center mb-2 p-6 rounded-lg ">
                <Text className="text-zinc-400 font-light text-lg">Nenhum Histórico...</Text>
              </View>
            )}
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
