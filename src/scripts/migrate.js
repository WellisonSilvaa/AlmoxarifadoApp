
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Configurações
const serviceAccount = require('../../firebase-service.json.json');
const supabaseUrl = 'https://fpqpdtcwohidryjekxhd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcXBkdGN3b2hpZHJ5amVreGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTA3MjAsImV4cCI6MjA5MTUyNjcyMH0.P4l_Do-v4d3oGtRwTh2h1iJVe6SCsAfDtVcog8MOOA8';

// 2. Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 3. Inicializar Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('--- Iniciando migração de dados ---');

  try {
    // A. Migrar ITENS
    console.log('Migrando Itens...');
    const itemsSnapshot = await db.collection('items').get();
    for (const doc of itemsSnapshot.docs) {
      const data = doc.data();
      await supabase.from('items').upsert({
        id: doc.id,
        name: data.name,
        description: data.description,
        photo_url: data.photoUrl,
        current_stock: data.currentStock,
        min_stock: data.minStock,
        needs_restock: data.needsRestock,
        category: data.category,
        created_at: data.createdAt ? data.createdAt.toDate() : new Date()
      });
    }

    // B. Migrar CARRETAS
    console.log('Migrando Carretas...');
    const trucksSnapshot = await db.collection('trucks').get();
    for (const doc of trucksSnapshot.docs) {
      const data = doc.data();
      await supabase.from('trucks').upsert({
        id: doc.id,
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        created_at: new Date()
      });
    }

    // C. Migrar FUNCIONÁRIOS
    console.log('Migrando Funcionários...');
    const employeesSnapshot = await db.collection('employees').get();
    for (const doc of employeesSnapshot.docs) {
      const data = doc.data();
      await supabase.from('employees').upsert({
        id: doc.id,
        name: data.name,
        email: data.email,
        department: data.department,
        position: data.position,
        is_active: data.isActive !== false,
        created_at: data.createdAt ? data.createdAt.toDate() : new Date()
      });
    }

    // D. Migrar PERFIS DE USUÁRIO (de users para profiles)
    console.log('Migrando Perfis/Usuários...');
    const usersSnapshot = await db.collection('users').get();
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      // Nota: No Supabase profiles.id deve bater com auth.users.id. 
      // Por enquanto vamos migrar os dados, mas o vínculo real acontece no login.
      await supabase.from('profiles').upsert({
        id: doc.id, // UID do Firebase
        name: data.name,
        role: data.role || 'employee',
        is_active: data.isActive !== false,
        employee_id: data.employeeId,
        created_at: data.createdAt ? data.createdAt.toDate() : new Date()
      });
    }

    // E. Migrar MOVIMENTAÇÕES
    console.log('Migrando Movimentações...');
    const movementsSnapshot = await db.collection('movements').get();
    for (const doc of movementsSnapshot.docs) {
      const data = doc.data();
      // Ajustar UUIDs se necessário. No Firebase são strings, no Supabase são UUID (compatíveis se forem formato texto).
      await supabase.from('movements').upsert({
        id: doc.id,
        item_id: data.itemId,
        item_name: data.itemName,
        type: data.type,
        quantity: data.quantity,
        employee_id: data.employeeId,
        employee_name: data.employeeName,
        truck_plate: data.truckPlate,
        date: data.date ? data.date.toDate() : (data.createdAt ? data.createdAt.toDate() : new Date())
      });
    }

    console.log('--- Migração concluída com sucesso! ---');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  }
}

migrate();
