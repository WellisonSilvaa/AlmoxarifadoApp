import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../styles/global';

const SearchableSelector = ({ 
  visible, 
  onClose, 
  onSelect, 
  items, 
  title, 
  placeholder,
  itemLabelKey = 'name',
  itemSubLabelKey = null
}) => {
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    if (!search) return items;
    return items.filter(item => 
      item[itemLabelKey]?.toLowerCase().includes(search.toLowerCase()) ||
      (itemSubLabelKey && item[itemSubLabelKey]?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, items]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={colors.secondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder || 'Buscar...'}
              value={search}
              onChangeText={setSearch}
              autoFocus={true}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={20} color={colors.secondary} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id || item.uid}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.itemRow} 
                onPress={() => {
                  onSelect(item);
                  onClose();
                  setSearch('');
                }}
              >
                <View style={styles.itemContent}>
                  <Text style={styles.itemLabel}>{item[itemLabelKey]}</Text>
                  {itemSubLabelKey && item[itemSubLabelKey] && (
                    <Text style={styles.itemSubLabel}>{item[itemSubLabelKey]}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary + '80'} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  title: {
    ...typography.title,
    fontSize: 18,
    color: colors.onSurface,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    ...typography.label,
    fontSize: 14,
    color: colors.primary,
    textTransform: 'none',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 56,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 16,
    color: colors.onSurface,
  },
  clearIcon: {
    fontSize: 18,
    color: colors.secondary,
    padding: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    ...typography.title,
    fontSize: 16,
    color: colors.onSurface,
  },
  itemSubLabel: {
    ...typography.body,
    fontSize: 13,
    color: colors.secondary,
    marginTop: 2,
  },
  selectArrow: {
    fontSize: 18,
    color: colors.primary + '80',
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.secondary,
    textAlign: 'center',
  },
});

export default SearchableSelector;
