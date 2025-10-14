import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';

const RECENT_CHAPTERS_KEY = 'recent_chapters';

export type RecentChapter = {
  id: string;
  title: string;
  subject: string;
  standard: string;
};

export default function RecentTab() {
  const [recent, setRecent] = useState<RecentChapter[]>([]);
  const [loading, setLoading] = useState(true);
  // No need for navigation hook, use router directly

  useEffect(() => {
    AsyncStorage.getItem(RECENT_CHAPTERS_KEY)
      .then(data => {
        if (data) setRecent(JSON.parse(data));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
  <Header title="તાજેતરના પ્રકરણો" showBack onBackPress={() => router.back()} />
      {recent.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
          કોઈ તાજેતરના પ્રકરણો મળ્યા નથી.
        </Text>
      ) : (
        <FlatList
          data={recent}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}
              onPress={() => router.push({ pathname: '/chapter/[id]', params: { id: item.id } })}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: '#666', fontSize: 13 }}>{item.subject} | ધોરણ {item.standard}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
