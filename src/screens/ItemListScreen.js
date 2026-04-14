
// src/screens/ItemListScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    RefreshControl,
    StyleSheet,
    TextInput,
    StatusBar,
    Dimensions,
    Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // 👈 Adicionado useSafeAreaInsets
import { colors, typography } from '../styles/global';
import { getImageUrl } from '../utils/storageUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // 👈 Adicionado ícones
import { useData } from '../context/DataContext';

const { width } = Dimensions.get('window');

const ItemListScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets(); // 👈 Obtendo insets
    const { items: contextItems, refreshData, loading: globalLoading } = useData();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshData();
        setRefreshing(false);
    };

    const items = contextItems;

    const filteredItems = useMemo(() => {
        return items.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [items, searchQuery]);

    const stats = useMemo(() => {
        const total = items.length;
        const lowStock = items.filter(item => item.needsRestock).length;
        return { total, lowStock };
    }, [items]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemCard}
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
        >
            <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                    {item.photoUrl ? (
                        <Image
                            source={{ uri: getImageUrl(item.photoUrl) }}
                            style={styles.itemImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <MaterialCommunityIcons name="package-variant-closed" size={32} color={colors.secondary} opacity={0.5} />
                        </View>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.skuText}>SKU-{item.id.substring(0, 5).toUpperCase()}</Text>
                        <View style={[
                            styles.statusBadge, 
                            { backgroundColor: item.needsRestock ? '#fff1f2' : '#f0fdf4' }
                        ]}>
                            <Text style={[
                                styles.statusText, 
                                { color: item.needsRestock ? colors.error : '#15803d' }
                            ]}>
                                {item.needsRestock ? 'Estoque Baixo' : 'Ativo'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    
                    <View style={styles.cardFooter}>
                        <View>
                            <Text style={styles.footerLabel}>Estoque</Text>
                            <Text style={[
                                styles.footerValue,
                                item.needsRestock && { color: colors.error }
                            ]}>
                                {item.currentStock || 0} unidades
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View>
                            <Text style={styles.footerLabel}>Preço (Est.)</Text>
                            <Text style={styles.footerValue}>R$ --</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />
            
            {/* Custom Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back-outline" size={28} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Gerenciamento de Itens</Text>
                    <View style={styles.profileIcon}>
                        <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                    </View>
                </View>
            </View>

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.listContent, 
                    { paddingBottom: 100 + insets.bottom } // 👈 Ajuste dinâmico
                ]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListHeaderComponent={
                    <View>
                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <View style={styles.searchWrapper}>
                                <Ionicons name="search-outline" size={20} color={colors.secondary} style={{ marginRight: 10 }} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar por nome, SKU ou categoria..."
                                    placeholderTextColor={colors.secondary + '80'}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                        </View>

                        {/* Stats Bento */}
                        <View style={styles.bentoStats}>
                            <View style={styles.largeStat}>
                                <Text style={styles.statLabel}>Total no Catálogo</Text>
                                <Text style={styles.statValueLarge}>{stats.total}</Text>
                                <Text style={styles.statSub}>itens registrados</Text>
                            </View>
                            <View style={[styles.smallStat, { backgroundColor: colors.primary }]}>
                                <LinearGradient
                                    colors={[colors.primary, colors.primaryVariant]}
                                    style={StyleSheet.absoluteFill}
                                />
                                <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>Alertas</Text>
                                <Text style={[styles.statValueSmall, { color: '#fff' }]}>{stats.lowStock}</Text>
                                <Text style={[styles.statSub, { color: 'rgba(255,255,255,0.8)' }]}>estoque baixo</Text>
                            </View>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={60} color={colors.secondary} opacity={0.3} style={{ marginBottom: 16 }} />
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Nenhum item corresponde à busca.' : 'Nenhum item cadastrado ainda.'}
                        </Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity 
                style={[
                    styles.fab,
                    { bottom: 30 + insets.bottom } // 👈 Posicionamento inteligente
                ]} 
                onPress={() => navigation.navigate('ItemForm')}
            >
                <LinearGradient
                    colors={[colors.primary, colors.primaryVariant]}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={32} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceVariant,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    backButton: {
        padding: 8,
    },
    backIconText: {
        fontSize: 20,
    },
    headerTitle: {
        ...typography.headline,
        fontSize: 18,
        color: colors.primary,
    },
    profileIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.surfaceVariant,
    },
    profileEmoji: {
        fontSize: 14,
    },
    listContent: {
        padding: 20,
        // paddingBottom definido dinamicamente no componente
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        ...typography.body,
        fontSize: 15,
        color: colors.onSurface,
    },
    bentoStats: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    largeStat: {
        flex: 1.5,
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 18,
        justifyContent: 'space-between',
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    smallStat: {
        flex: 1,
        padding: 16,
        borderRadius: 18,
        justifyContent: 'space-between',
        minHeight: 120,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    statLabel: {
        ...typography.label,
        fontSize: 10,
        color: colors.secondary,
        textTransform: 'uppercase',
    },
    statValueLarge: {
        ...typography.headline,
        fontSize: 32,
        color: colors.onSurface,
    },
    statValueSmall: {
        ...typography.headline,
        fontSize: 32,
        color: '#fff',
    },
    statSub: {
        ...typography.body,
        fontSize: 11,
        color: colors.secondary,
    },
    itemCard: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        gap: 16,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 14,
        backgroundColor: colors.surfaceContainerLow,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        fontSize: 24,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    skuText: {
        ...typography.label,
        fontSize: 10,
        color: colors.primary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        ...typography.label,
        fontSize: 9,
    },
    itemName: {
        ...typography.title,
        fontSize: 17,
        color: colors.onSurface,
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    footerLabel: {
        ...typography.body,
        fontSize: 10,
        color: colors.secondary,
        marginBottom: 2,
    },
    footerValue: {
        ...typography.title,
        fontSize: 13,
        color: colors.onSurface,
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: colors.surfaceVariant,
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
    },
    emptyEmoji: {
        fontSize: 40,
        marginBottom: 16,
    },
    emptyText: {
        ...typography.body,
        color: colors.secondary,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    fabGradient: {
        flex: 1,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabIcon: {
        color: '#fff',
        fontSize: 28,
    }
});

export default ItemListScreen;
