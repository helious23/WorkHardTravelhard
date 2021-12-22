import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const WORKING = "working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editing, setEditing] = useState(false);
  const travel = async () => {
    setWorking(false);
  };
  const work = async () => {
    setWorking(true);
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => setEditText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
      Alert.alert("저장 할 수 없습니다");
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      s !== null ? setToDos(JSON.parse(s)) : null;
    } catch (error) {
      console.log(error);
      Alert.alert("불러올 수 없습니다");
    }
  };

  const loadWorking = async () => {
    try {
      const w = await AsyncStorage.getItem(WORKING);
      w !== null ? setWorking(JSON.parse(w)) : null;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(async () => {
    loadToDos();
    loadWorking();
  }, []);

  useEffect(async () => {
    await AsyncStorage.setItem(WORKING, JSON.stringify(working));
  }, [working]);

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed, editing },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("해당 항목을 삭제하시겠습니까?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("해당 항목이 삭제됩니다", "삭제하시겠습니까?", [
        { text: "취소" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
    return;
  };

  const deleteAllToDos = async () => {
    try {
      if (Platform.OS === "web") {
        const ok = confirm("모든 항목을 삭제하시겠습니까?");
        if (ok) {
          await AsyncStorage.removeItem(STORAGE_KEY);
          console.log("deleted");
          setToDos({});
        }
      } else {
        Alert.alert("모든 항목이 삭제됩니다", "삭제하시겠습니까?", [
          { text: "취소" },
          {
            text: "모두 삭제",
            style: "destructive",
            onPress: async () => {
              await AsyncStorage.removeItem(STORAGE_KEY);
              console.log("deleted");
              setToDos({});
            },
          },
        ]);
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  const toggleCompleteToDo = async (key) => {
    const completedToDo = { ...toDos };
    if (completedToDo[key].completed) {
      completedToDo[key].completed = false;
    } else {
      completedToDo[key].completed = true;
    }

    setToDos(completedToDo);
    await saveToDos(completedToDo);
  };

  const clickEdit = async (key) => {
    setEditing(true);
    const editingToDo = { ...toDos };
    editingToDo[key].editing = true;
    // console.log(editingToDo[key]);
    return;
  };

  const editToDo = async (key) => {
    const editingToDo = { ...toDos };
    if (editText !== "") editingToDo[key].text = editText;
    editingToDo[key].editing = false;
    setEditing(false);
    setToDos(editingToDo);
    await saveToDos(editingToDo);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "600",
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "600",
              color: working ? theme.grey : "white",
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        autoCorrect={false}
        returnKeyType="done"
        value={text}
        placeholder={working ? "할 일을 추가하세요" : "어디로 떠나고 싶으세요?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {toDos[key].completed ? (
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: "line-through",
                  }}
                >
                  {toDos[key].text}
                </Text>
              ) : toDos[key].editing ? (
                <TextInput
                  style={styles.editInput}
                  value={editText || toDos[key].text}
                  onChangeText={onChangeEditText}
                  onSubmitEditing={() => editToDo(key)}
                  autoCorrect={false}
                  returnKeyType="done"
                />
              ) : (
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
              )}
              <View style={{ flexDirection: "row" }}>
                {!toDos[key].editing && (
                  <TouchableOpacity onPress={() => clickEdit(key)}>
                    <Ionicons
                      name="pencil-outline"
                      style={{ marginRight: 10 }}
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                )}
                {toDos[key].editing ? null : toDos[key].completed ? (
                  <TouchableOpacity
                    onPress={() => toggleCompleteToDo(key)}
                    style={{ marginRight: 10 }}
                  >
                    <Ionicons
                      name="reload-circle-outline"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => toggleCompleteToDo(key)}
                    style={{ marginRight: 10 }}
                  >
                    <Ionicons name="checkbox-outline" size={24} color="white" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Ionicons name="trash-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
      {Object.keys(toDos).length > 0 && (
        <TouchableOpacity style={styles.trash} onPress={deleteAllToDos}>
          <Ionicons name="md-trash-outline" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  editInput: {
    backgroundColor: "white",
    width: "80%",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  toDo: {
    backgroundColor: theme.grey,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  trash: {
    position: "absolute",
    bottom: "10%",
    right: "10%",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 100,
    paddingLeft: 2,
  },
});
