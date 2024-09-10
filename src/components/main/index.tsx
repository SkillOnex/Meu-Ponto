import React, { useEffect, useState } from 'react';
import { Platform, Modal, Pressable, Text, TextInput, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { getCards, insertCard, updateCardStatus, } from '../../data/database';

import { Feather } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view'

import * as Location from 'expo-location';

import { useRouter } from 'expo-router';

interface Card {
    id: number;
    company: string;
    hours: string;
    hours_exit: string;
    hours_total: string;
    jornade: string;
    date: string;
    status: string;
    local: string;
}

export function Main() {
    const [modalVisible, setModalVisible] = useState(false);


    const [company, setCompany] = useState('');
    const [jornada, setJornada] = useState('');

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const currentDate = new Date(Date.now()).toLocaleDateString();

    const [openCards, setOpenCards] = useState<Card[]>([]);
    const [closedCards, setClosedCards] = useState<Card[]>([]);

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);



    useEffect(() => {






        // Função para obter os cartões
        const fetchCards = async () => {
            getCards((fetchedCards) => {
                // Filtra os cards com status 'Aberto'
                const openCards = fetchedCards.filter(card => card.status === 'Aberto');
                setOpenCards(openCards);

                // Filtra os cards com status 'Fechado'
                const closedCards = fetchedCards.filter(card => card.status === 'Fechado');
                setClosedCards(closedCards);
            });
        };

        // Função para atualizar a hora em tempo real
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString());
        };

        // Chama a função para buscar os cartões ao iniciar o componente
        fetchCards();

        // Configura o intervalo para atualizar a hora a cada segundo
        const intervalId = setInterval(updateTime, 1000);

        // Limpa o intervalo ao desmontar o componente
        return () => clearInterval(intervalId);
    }, []);  // O array vazio [] indica que o efeito será executado apenas ao montar o componente




    const handleSubmit = async () => {
        try {
            // Insere o card com o status 'Aberto'
            // company: string, hours: string, hours_exit: string, hours_total: string, date: string, status: string
            await insertCard(company, currentTime, '', '', jornada, currentDate, 'Aberto', address || '');
            setModalVisible(false);

            // Busca os cards do banco de dados
            getCards((fetchedCards) => {
                // Filtra e atualiza os cards com status 'Aberto'
                const openCards = fetchedCards.filter(card => card.status === 'Aberto');
                setOpenCards(openCards);

                // Filtra e atualiza os cards com status 'Fechado'
                const closedCards = fetchedCards.filter(card => card.status === 'Fechado');
                setClosedCards(closedCards);
            });

            //console.log('Card created successfully');
            // Fechar o modal ou fornecer feedback ao usuário
        } catch (error) {
            console.error('Error creating card:', error);
        }
    };


    const handlePress = () => {
        setLocation(null);
        setAddress(null);
        setErrorMsg(null);


        // Se a permissão já foi concedida, continue com a lógica normal (abre o modal)
        setModalVisible(true);

        (async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (reverseGeocode.length > 0) {
                const { formattedAddress} = reverseGeocode[0];


                // Monta o endereço usando subregion no lugar de city
                setAddress(`${formattedAddress}`);
            }
        })();





    };

    let text = 'Buscando localização';
    if (errorMsg) {
        text = errorMsg;
    } else if (address) {
        text = `${address}`;
    }
    const parseTimeString = (timeString: any) => {
        // Verifica se o tempo inclui AM/PM
        const amPmMatch = timeString.match(/(AM|PM)$/i);
        let timeParts;

        if (amPmMatch) {
            // Formato com AM/PM
            timeParts = timeString.replace(/(AM|PM)$/i, '').trim().split(':').map(Number);
            const [hours, minutes, seconds] = timeParts;

            if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                throw new Error("Invalid time format");
            }

            // Ajusta a hora para o formato 24 horas
            const hourIn24 = amPmMatch[1].toUpperCase() === 'PM' && hours !== 12
                ? hours + 12
                : amPmMatch[1].toUpperCase() === 'AM' && hours === 12
                    ? 0
                    : hours;

            return `1970-01-01T${hourIn24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}Z`;
        } else {
            // Formato 24 horas
            timeParts = timeString.split(':').map(Number);
            const [hours, minutes, seconds] = timeParts;

            if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                throw new Error("Invalid time format");
            }

            return `1970-01-01T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}Z`;
        }
    };

    const convertDecimalToHMS = (decimalHours: any) => {
        // Converte horas decimais para minutos e segundos
        const totalSeconds = decimalHours * 3600;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        // Formata a string para H:M:S
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleClose = async () => {
        try {
            // Encontrar o cartão com status 'Aberto'
            const openCard = openCards.find(card => card.status === 'Aberto');

            if (openCard) {
                // Converte as horas de entrada e saída para objetos Date
                const entryTimeString = parseTimeString(openCard.hours);
                const exitTimeString = parseTimeString(currentTime);

                const entryTime = new Date(entryTimeString);
                const exitTime = new Date(exitTimeString);

                if (isNaN(entryTime.getTime()) || isNaN(exitTime.getTime())) {
                    throw new Error("Invalid entry or exit time");
                }

                // Calcula o total de horas trabalhadas em horas decimais
                const hoursWorked = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);

                // Converte o total de horas decimais para H:M:S
                const hoursTotalHMS = convertDecimalToHMS(hoursWorked);

                // Atualiza o status do cartão e o hours_total no banco de dados
                await updateCardStatus(openCard.id, currentTime, 'Fechado', hoursTotalHMS);

                // Atualiza o estado dos cartões localmente
                setOpenCards(prevCards => prevCards.filter(card => card.id !== openCard.id));
                setClosedCards(prevCards => [
                    ...prevCards,
                    {
                        ...openCard,
                        status: 'Fechado',
                        hours_exit: currentTime,
                        hours_total: hoursTotalHMS // Atualiza o total de horas trabalhadas
                    }
                ]);
            }
        } catch (error) {
            console.error('Error updating card status:', error);
        }
    };



    const router = useRouter();
    const handlePressPage = () => {
        router.replace('../../views/AllItemsScreen');
    };




    return (
        <View>
            <View className="w-full">
                <View style={{ borderColor: "#24272C" }} className='w-full mt-4 p-1 border-2  border-dashed rounded-lg active:bg-slate-400 '>
                    <View style={{ backgroundColor: "#1F222B" }} className="w-full p-6 rounded-lg ">
                        {openCards.length > 0 ? (
                            // Se houver um card com status 'Aberto', mostra o botão 'Fechar'
                            <Pressable className="w-full flex-row md:h-60 rounded-2xl items-center justify-center" onPress={handleClose}>
                                <Feather name="x" size={24} color="#FEFAF1" />
                                <Text className='text-lg font-semibold text-zinc-100'> Fechar Ponto</Text>
                            </Pressable>
                        ) : (
                            // Caso contrário, mostra o botão 'plus'
                            <Pressable className="w-full flex-row md:h-60  justify-center items-center rounded-2xl " onPress={handlePress}>
                                <Feather name="plus" size={24} color="#FEFAF1" />
                                <Text className='text-lg font-semibold text-zinc-100'> Abrir Ponto</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                <View className='w-full md:h-60 rounded-2xl mt-5 mb-4'>
                    {openCards.length > 0 ? (
                        openCards.map((card, index) => (
                            <View key={index} style={{ backgroundColor: "#1F222B" }} className='w-full mb-2 p-6  rounded-lg  hover:bg-gray-100'>
                                <View className='flex-row mb-4'>
                                    <Feather className="me-2" name='unlock' color="#16a34a" size={24} />
                                    <Text className='text-2xl font-bold tracking-tight text-green-600'>Aberto</Text>
                                </View>

                                <View className="w-full flex-row items-center mb-2">
                                    <Feather className="me-2" name='home' size={18} color="#FEFAF1" />
                                    <Text className="font-normal text-zinc-300">Empresa: {card.company}</Text>
                                </View>
                                <View className="w-full flex-row items-center mb-2">
                                    <Feather className="me-2" name='map-pin' size={18} color="#FEFAF1" />
                                    <Text className="font-normal text-zinc-300 ">Local: {card.local}</Text>
                                </View>
                                <View className="w-full flex-row items-center mb-2">
                                    <Feather className="me-2" name='clock' size={18} color="#FEFAF1"></Feather>
                                    <Text className="font-normal text-zinc-300">Entrada: {card.hours}</Text>
                                </View>
                                <View className="w-full flex-row items-center mb-2">
                                    <Feather className="me-2" name='trending-up' size={18} color="#FEFAF1"></Feather>
                                    <Text className="font-normal text-zinc-300">Jornada: {card.jornade} Horas</Text>
                                </View>
                                <View className="w-full flex-row items-center mb-2">
                                    <Feather className="me-2" name='calendar' size={18} color="#FEFAF1"></Feather>
                                    <Text className="font-normal text-zinc-300">Data: {card.date}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={{ backgroundColor: "#1F222B" }} className='w-full flex items-center mb-2 p-6  rounded-lg '>
                            <Text className='text-zinc-400 font-light text-lg'>Nenhum card aberto...</Text>
                        </View>
                    )}
                </View>




                <View className='w-full h-[23rem] md:h-60  rounded-2xl mb-4'>
                    <View className='flex-row justify-between items-center mb-5'>
                        <Text className='text-2xl font-medium text-zinc-300 ' >Outros pontos</Text>
                        <Text className='font-normal text-zinc-500' onPress={handlePressPage}>Ver todos</Text>
                    </View>


                    <PagerView style={{ flex: 1 }} initialPage={0} pageMargin={14}>

                        {closedCards.length > 0 ? (
                            // Ordena os cartões fechados pelo maior ID
                            closedCards
                                .sort((a, b) => b.id - a.id) // Ordena em ordem decrescente
                                .map((card, index) => (
                                    <View key={index} style={{ backgroundColor: "#1F222B" }} className='w-full mb-2 p-6 pt-8  rounded-2xl  hover:bg-gray-100'>
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
                            <View style={{ backgroundColor: "#1F222B" }} className='w-full flex justify-center items-center mb-2 p-6  rounded-2xl '>
                                <Text className='text-zinc-400 font-light text-lg'>Nenhum Histórico...</Text>
                            </View>
                        )}
                    </PagerView>


                </View >

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View className="flex-1 justify-center items-center bg-transparent bg-opacity-50">
                        <View className="relative p-4 w-full max-w-md max-h-full">
                            <View style={{ backgroundColor: "#1F222B" }} className="relative rounded-lg shadow-lg shadow-slate-900">


                                <ScrollView className="p-4">
                                    <View className="grid gap-4 mb-4 grid-cols-2">
                                        <View className="col-span-2">
                                            <Text className="block mb-2 text-sm font-light text-zinc-200">Empresa</Text>
                                            <TextInput
                                                className="bg-[#1F222B] border border-gray-300 text-zinc-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                placeholder="Digite aqui..."
                                                value={company}
                                                onChangeText={setCompany}
                                                placeholderTextColor="gray"
                                            />
                                        </View>



                                        <View className="col-span-2 sm:col-span-1">
                                            <Text className="block mb-2 text-sm font-light text-zinc-200">Qual a Jornada de trabalho?</Text>
                                            <TextInput
                                                className="bg-[#1F222B] border border-gray-300 text-zinc-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                value={jornada}
                                                keyboardType="numeric"
                                                placeholder='Ex. 8 horas'
                                                onChangeText={setJornada} // Exibe a data atual formatada
                                                placeholderTextColor="gray"
                                            />
                                        </View>

                                        <View className="col-span-2 sm:col-span-1">
                                            <Text className="block mb-2 text-sm font-light text-zinc-200">Hora atual</Text>
                                            <TextInput
                                                className="bg-[#1F222B] border border-gray-300 text-zinc-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                value={currentTime}
                                                editable={false} // Exibe a data atual formatada

                                            />
                                        </View>

                                        <View className="col-span-2 sm:col-span-1">
                                            <Text className="block mb-2 text-sm font-light text-zinc-200">Data</Text>
                                            <TextInput
                                                className="bg-[#1F222B] border border-gray-300 text-zinc-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                value={currentDate}
                                                editable={false}

                                            />
                                        </View>

                                        <View className="col-span-2 sm:col-span-1 ">
                                            <Text className="block mb-2 text-sm font-light text-zinc-200">Localização</Text>

                                            <View className="w-full p-6 bg-gray-700 border border-slate-500 rounded-lg shadow hover:bg-gray-100">
                                                {/* <Pressable className="w-full md:h-60 rounded-2xl items-center justify-center" onPress={handleCameraOpen}>
                                                        <Feather name="camera" size={24} color="#FEFAF1" />
                                                    </Pressable> */}
                                                <Text className='text-zinc-200 text-sm'>{text}</Text>
                                            </View>

                                        </View>
                                    </View>

                                    <View className="w-full col-span-2 sm:col-span-1 p-6 bg-gray-700 border border-slate-500 rounded-lg shadow active:ring-blue-500 mb-5">
                                        <TouchableOpacity onPress={handleSubmit} className='active:ring-blue-500'>
                                            <View className="flex-row items-center justify-center">
                                                <Feather name="send" className="" size={20} color="#FEFAF1" />
                                                <Text className="text-lg font-bold text-zinc-200"> Enviar</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex mb-1 items-center p-1 rounded-t">
                                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                                            <Text className="text-2xl font-normal text-zinc-200">
                                                <Feather name="x" size={20} color="#FEFAF1" /> Sair
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
}