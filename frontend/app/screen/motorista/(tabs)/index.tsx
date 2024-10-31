import config from "@/app/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";


interface Imagem {
  id: number;
  nome: string;
  dados: string | null;
}

interface Motorista {
  nome: string;
  telefone: string;
  idade: number;
  imagem: Imagem;
}
export default function Index() {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [escolasAtendidas, setEscolasAtendidas] = useState([]);

const fetchEscolasAtendidas = async (idMotorista) => {
  const response = await fetch(`${config.IP_SERVER}/api/escolas/atendidas/${idMotorista}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar escolas atendidas');
  }

  const escolasData = await response.json();

  // Adicionar a quantidade de crianças a cada escola
  const escolasComQuantidade = await Promise.all(
    escolasData.map(async (escola) => {
      const countResponse = await fetch(`${config.IP_SERVER}/api/escolas/${escola.id}/motorista/${idMotorista}/criancas/count`);
      const quantidadeCriancas = await countResponse.json();
      return { ...escola, quantidadeCriancas };
    })
  );

  return escolasComQuantidade;
};



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const idMotorista = await AsyncStorage.getItem('idMotorista');
        const escolasData = await fetchEscolasAtendidas(idMotorista);
        setEscolasAtendidas(escolasData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d99ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>

      <ScrollView style={styles.container}>

        <Text style={{ fontSize: 20, marginLeft: 20 }}>Escolas de atuação</Text>

        <View style={styles.containerCards}>
          {escolasAtendidas.length === 0 ? (
            <Text>Nenhuma escola atendida</Text>
          ) : (
            escolasAtendidas.map((escola) => (
              <Pressable
                key={escola.id}
                style={styles.cardsMotoristas}
                onPress={() =>
                  router.navigate(
                    `/screen/motorista/escola/detalhesEscola?escolaId=${escola.id}`
                  )
                }
              >
                <Text style={styles.quantidadeCrianca}>{escola.quantidadeCriancas} Crianças</Text>

                <View style={{ flexDirection: "row", justifyContent: "flex-right" }}>
                  <Image source={require('@/app/assets/icons/school.png')} />
                  <Text style={styles.nomeEscola}>{escola.nome}</Text>
                </View>

              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  cardDados: {
    backgroundColor: "#ffbf00",
    padding: 20,
    margin: 20,
    borderRadius: 20,
    height: 120,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  containerCards: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  cardsMotoristas: {
    height: 120,
    width: 160,
    backgroundColor: "#0EAFFF",
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between"
  },

  textoDados: {
    fontSize: 15,
    fontWeight: "600",
  },

  buttonText: {
    color: "black",
    fontWeight: "700",
  },

  botaoMenu: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: 40,
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  image: {
    borderRadius: 75,
    borderColor: "#ff0000",
    borderWidth: 2,
    width: 100,
    height: 100,
    alignSelf: 'center'
  },
  icon: {
    height: 60,
    width: 60,
    borderRadius: 50
  },
  nomeEscola: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
  quantidadeCrianca: {
    fontWeight: "400",
    color: "white",
    fontSize: 15,
    textAlign: "right"
  }

});
