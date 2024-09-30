import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { View, StyleSheet, Text, TextInput, SafeAreaView } from "react-native";
import { useEffect, useState } from "react";
import config from '@/app/config';
import { Link, useLocalSearchParams } from 'expo-router';

export default function CadastroCrianca() {

    const [crianca, setCrianca] = useState({ nome: '', idade: 0 });
    const [loading, setLoading] = useState(false);
    const [ofertas, setOfertas] = useState([]);

    const { id } = useLocalSearchParams();


    const fetchCrianca = async () => {
        try {
            console.log(`Buscando dados para a criança com ID: ${id}`);
            const response = await fetch(`${config.IP_SERVER}/criancas/${id}`);
            const data = await response.json();
            setCrianca(data);

        } catch (error) {
            console.error('Erro ao buscar os detalhes da criança:', error);
        } finally {
            setLoading(false);
        }
    };


    const fetchOfertas = async () => {
        try {
            const response = await fetch(`${config.IP_SERVER}/oferta/crianca/${id}`);
            const data = await response.json();
            setOfertas(data);
            console.log(`ID OFERTA${id}`)
        } catch (error) {
            console.error('Erro ao buscar as ofertas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const carregarDados = async () => {
            setLoading(true);
            await fetchCrianca();
            await fetchOfertas();

            setLoading(false);
        };
        carregarDados();
    }, []);


    return (
        <SafeAreaView style={styles.total}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Text style={{ fontWeight: '800', textAlign: 'center', fontSize: 20 }}>Cadastrar Criança</Text>
                <View style={styles.containerInputs}>
                    <Text style={styles.name}>{crianca.nome}</Text>

                    <TextInput
                        placeholder="Nome da criança"
                        style={styles.textInputs}
                        value={crianca.nome}
                        onChangeText={(text) => setCrianca({ ...crianca, nome: text })} // Atualiza apenas o nome
                    />
                    <TextInput
                        placeholder="Idade da criança"
                        style={styles.textInputs}
                        value={crianca.idade}
                        onChangeText={(text) => setCrianca({ ...crianca, idade: text })} // Atualiza apenas a idade
                        keyboardType="numeric"
                    />
                </View>



                <View style={styles.containerButton}>

                    <Link
                        href={{
                            pathname: `/screen/responsavel/crianca/escola/listaEscolas`,
                            params: { crianca: JSON.stringify(crianca) }, // Passa a criança para a próxima tela
                        }}
                    >
                        <Text style={styles.buttonText}>Procurar perueiro</Text>

                    </Link>

                    <Link
                        href={{
                            pathname: `/screen/responsavel/crianca/ofertas/aceitaOferta`,
                            params: { crianca: JSON.stringify(crianca) },
                        }}
                    >
                        <Text style={styles.buttonText}>Procurar ofertas</Text>
                    </Link>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    total: {
        flex: 1,
        margin: 10,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between'
    },
    containerInputs: {
        flex: 1,
        justifyContent: 'center',
        gap: 20
    },
    textInputs: {
        backgroundColor: "transparent",
        width: "100%",
        height: 50,
        borderRadius: 20,
        borderColor: "black",
        borderWidth: 2,
        textAlign: "center"
    },
    buttonSubmit: {
        backgroundColor: "#ffbf00",
        width: "100%",
        height: 50,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "black",
        fontWeight: "700",
    },
    containerButton: {
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 20,
    }
});
