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

interface TimerProps {
  start: any;
  end: any;
}

const Timer = ({ start, end }: TimerProps) => {
    const [timeDifference, setTimeDifference] = useState(calculateTimeDifference(start, end));
    const [notificationSent, setNotificationSent] = useState(false);

    useEffect(() => {
      const interval = setInterval(() => {
        const newTimeDifference = calculateTimeDifference(start, end);
        setTimeDifference(newTimeDifference);

        if (!notificationSent && newTimeDifference <= 600000 && newTimeDifference > 0) {
          setNotificationSent(true);
          if (Platform.OS === 'android') {
            PushNotification.localNotification({
              channelId: 'default-channel-id',
              message: `До конца пары осталось ${Math.floor(newTimeDifference / (1000 * 60))} минут!`,
              soundName: 'default',
            });
          } else {
            PushNotification.localNotification({
              message: `До конца пары осталось ${Math.floor(newTimeDifference / (1000 * 60))} минут!`,
              soundName: 'default',
            });
          }
        }
      }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [start, end, notificationSent]); // added notificationSent to dependencies list

  function calculateTimeDifference(start: { split: (arg0: string) => [any, any]; }, end: { split: (arg0: string) => [any, any]; }) {
    const now = new Date();
    const [startHours, startMinutes] = start.split(':');
    const [endHours, endMinutes] = end.split(':');
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes, 0, 0);
    const startDifference = startDate.getTime() - now.getTime();
    const endDifference = endDate.getTime() - now.getTime();
    const diffInMinutes = Math.floor(startDifference / (1000 * 60));
    if (startDifference <= 0 && endDifference > 0) {
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

const MathSchedule = ({ day }: { day: string }) => {
  const mathClasses = [
    { day: 'monday', name: 'Математика', time: '8:00 - 9:30' },
    { day: 'monday', name: 'Математика', time: '9:40 - 11:10' },
    { day: 'tuesday', name: 'Математика', time: '11:20 - 12:50' },
    { day: 'wednesday', name: 'Математика', time: '13:30 - 15:00' },
    { day: 'friday', name: 'Математика', time: '15:10 - 16:40' },
  ];

  const classesForDay = mathClasses.filter((item) => item.day.toLowerCase() === day.toLowerCase());


  return (
    <View style={styles.mathSchedule}>
      <Text style={styles.mathTitle}>Расписание:</Text>
      <FlatList
        data={classesForDay}
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
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setSelectedDay(dayOfWeek.toLowerCase());
  }, []);

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
          <MathSchedule day={selectedDay} />
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

type NavigationBarProps = {
  setModalVisible: (visible: boolean) => void;
}

const NavigationBar = ({ setModalVisible }: NavigationBarProps) => {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.navButtonText}>Расписание</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',

  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // <-- Add this line
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
  mathSchedule: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
  export default ScheduleScreen ; NavigationBar;