import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, DrawerLayoutAndroid, TouchableOpacity, Modal, Alert, FlatList } from 'react-native';
import PushNotification, { Importance } from 'react-native-push-notification';  



PushNotification.createChannel(
  {
    channelId: 'default-channel-id', 
    channelName: 'Default channel',
    channelDescription: 'A default channel for notifications',
    importance: Importance.HIGH,
    vibrate: true,
    soundName: 'default', 
    playSound: true, 
  },
  created => console.log(`createChannel returned '${created}'`)
);

PushNotification.configure({
  onNotification: function(notification) {
    console.log(notification);
  },
  popInitialNotification: true,
  requestPermissions: Platform.OS === 'ios' ? true : false, 
   permissions: {
    alert: true,
     badge: true,
    sound: true,
   },
});
const Timer = ({ start, end }) => {
  const [timeDifference, setTimeDifference] = useState(calculateTimeDifference(start, end));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeDifference(calculateTimeDifference(start, end));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [start, end]);

  function calculateTimeDifference(start: { split: (arg0: string) => [any, any]; }, end: { split: (arg0: string) => [any, any]; }) {
    const now = new Date();
    const [startHours, startMinutes] = start.split(':');
    const [endHours, endMinutes] = end.split(':');
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes, 0, 0);
    const startDifference = startDate.getTime() - now.getTime();
    const endDifference = endDate.getTime() - now.getTime();
    if (endDifference <= 0 && endDifference > -60000) {
      if (Platform.OS === 'android') {
        PushNotification.localNotification({
          channelId: 'default-channel-id',
          message: `Пара окончена!`,
          soundName: 'default',
        });
      } else {
        PushNotification.localNotification({
          message: `Пара окончена!`,
          soundName: 'default',
        });
      }
    }
    if (startDifference > 0) {
      return startDifference;
    } else if (endDifference > 0) {
      return endDifference;
    } else {
      return 0;
    }
  }
  

  function formatTime(timeDifference: number) {
    if (timeDifference <= 0) {
      return '00:00';
    }

    const minutes = Math.floor(timeDifference / 60000);
    const seconds = Math.floor((timeDifference % 60000) / 1000);
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timer}>{formatTime(timeDifference)}</Text>
    </View>
  );
};

const MathSchedule = () => {
  const mathClasses = [
    { name: 'Математика', time: '8:00 - 9:30' },
    { name: 'Математика', time: '9:40 - 11:10' },
    { name: 'Математика', time: '11:20 - 12:50' },
    { name: 'Математика', time: '13:30 - 15:00' },
    { name: 'Математика', time: '15:10 - 16:40' },
  ];

  return (
    <View>
      <Text style={styles.mathTitle}>Расписание:</Text>
      <FlatList
        data={mathClasses}
        renderItem={({ item }) => (
          <View style={styles.mathItem}>
            <Text style={styles.mathName}>{item.name}</Text>
            <Text style={styles.mathTime}>{item.time}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const ScheduleScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <NavigationBar setModalVisible={setModalVisible} />
      <Text style={styles.title}>Время пар:</Text>
      <View style={styles.timesContainer}>
        {times.map((time, index) => {
          const startTime = time.start;
          const endTime = time.end;
          return (
            <View style={styles.timeContainer} key={index}>
              <Text style={styles.time}>{startTime} - {endTime}</Text>
              <Timer start={startTime} end={endTime} />
            </View>
          );
        })}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <MathSchedule />
            <TouchableOpacity
              style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <Text style={styles.textStyle}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const NavigationBar = ({ setModalVisible }) => {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navButton}>
        <Text style={styles.navButtonText}>Время</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.navButtonText}>Расписание</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton}>
        <Text style={styles.navButtonText}>Настройки</Text>
      </TouchableOpacity>
    </View>
  );
};


const times = [
  { start: '08:30', end: '09:50' },
  { start: '10:00', end: '11:20' },
  { start: '12:00', end: '13:20' },
  { start: '13:30', end: '14:50' },
  { start: '15:00', end: '16:20' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timesContainer: {
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  time: {
    fontSize: 16,
    marginRight: 10,
  },
  timerContainer: {
    borderWidth: 2,
    borderRadius: 5,
    padding: 5,
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  activeTabButton: {
    backgroundColor: '#333',
  },
  tabButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  navButton: {
    paddingHorizontal: 10,
  },
  navButtonText: {
    fontSize: 16,
    color: '#333',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    height: 50,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  modalView: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: "80%",
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 20,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  mathTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  mathItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  mathName: {
    fontSize: 18,   
    fontWeight: "bold",
  },
  mathTime: {
    fontSize: 16,
    marginLeft: 10,
  },
});
  export default ScheduleScreen ; NavigationBar;
