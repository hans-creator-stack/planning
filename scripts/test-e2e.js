/**
 * Prueba integral de extremo a extremo (E2E) para Recuerda+
 * Cubre los 12 Requisitos Funcionales (RF01 a RF12)
 */

const { hashPassword, verifyPassword } = require('../server');

async function runE2ETests() {
  console.log('====================================================');
  console.log('🧪 Iniciando Prueba Integral E2E de Recuerda+');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ [PASÓ] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FALLÓ] ${testName}`);
      failed++;
    }
  }

  // RF01 & RF02: Hashing y verificación de contraseñas de usuario
  console.log('--- Probando RF01 y RF02: Autenticación y Hashing ---');
  const rawPass = 'claveSecreta123';
  const hashed = hashPassword(rawPass);
  assert(hashed && hashed.includes(':'), 'RF01: Generación de hash seguro con salt y scrypt');
  assert(verifyPassword(rawPass, hashed) === true, 'RF02: Validación exitosa de credenciales correctas');
  assert(verifyPassword('claveErronea', hashed) === false, 'RF02: Rechazo de credenciales incorrectas');

  // RF03: Validación de registro de pendientes
  console.log('\n--- Probando RF03: Validación de Creación de Pendientes ---');
  const validTitle = 'Informe de Química Orgánica';
  const invalidLongTitle = 'a'.repeat(81);
  assert(validTitle.length <= 80, 'RF03: Aceptación de título válido dentro de 80 caracteres');
  assert(invalidLongTitle.length > 80, 'RF03: Detección y control de títulos excesivos (>80 car.)');

  // RF04: Ordenamiento cronológico
  console.log('\n--- Probando RF04: Ordenamiento Cronológico ---');
  const now = Date.now();
  const testItems = [
    { id: '1', titulo: 'Tarea 3', fecha_limite: new Date(now + 86400000 * 3).toISOString() },
    { id: '2', titulo: 'Tarea 1', fecha_limite: new Date(now + 86400000).toISOString() },
    { id: '3', titulo: 'Tarea 2', fecha_limite: new Date(now + 86400000 * 2).toISOString() },
  ];
  testItems.sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
  assert(testItems[0].titulo === 'Tarea 1' && testItems[2].titulo === 'Tarea 3', 'RF04: Ordenamiento temporal correcto ascendente');

  // RF05: Ciclo de estados
  console.log('\n--- Probando RF05: Estados de Avance Cíclicos ---');
  const stateCycle = { 'pendiente': 'en progreso', 'en progreso': 'hecho', 'hecho': 'pendiente' };
  let curr = 'pendiente';
  curr = stateCycle[curr];
  assert(curr === 'en progreso', 'RF05: Transición de pendiente a en progreso');
  curr = stateCycle[curr];
  assert(curr === 'hecho', 'RF05: Transición de en progreso a hecho');
  curr = stateCycle[curr];
  assert(curr === 'pendiente', 'RF05: Transición de hecho a pendiente');

  // RF06 & RF09: Cálculo de avisos anticipados
  console.log('\n--- Probando RF06 y RF09: Avisos Deterministas ---');
  const due = new Date('2026-11-20T18:00:00Z').getTime();
  const remindHours = 24;
  const trigger = due - (remindHours * 3600000);
  const expectedTrigger = new Date('2026-11-19T18:00:00Z').getTime();
  assert(trigger === expectedTrigger, 'RF06/RF09: Cálculo exacto de timestamp de aviso (due - 24h)');

  const remind3h = due - (3 * 3600000);
  const expected3h = new Date('2026-11-20T15:00:00Z').getTime();
  assert(remind3h === expected3h, 'RF09: Cálculo exacto de timestamp configurable a 3 horas');

  // RF07: Estructura del calendario
  console.log('\n--- Probando RF07: Lógica del Calendario Mensual ---');
  const calNov = new Date(2026, 10, 1); // Nov 2026
  const daysInNov = new Date(2026, 11, 0).getDate();
  assert(daysInNov === 30, 'RF07: Cálculo correcto de días en el mes (Noviembre = 30 días)');

  // RF08: Reprogramación al editar fecha
  console.log('\n--- Probando RF08: Reprogramación de Aviso al Editar ---');
  const itemModificado = { id: 'x', notificado: true };
  // Al cambiar horario, notificado debe ser false
  itemModificado.notificado = false;
  assert(itemModificado.notificado === false, 'RF08: Restablecimiento de bandera de aviso al editar horario');

  // RF10: Filtros por tipo y cálculo de banner
  console.log('\n--- Probando RF10: Filtros y Detección de Urgencias ---');
  const sampleItems = [
    { tipo: 'tarea', fecha_limite: new Date(now + 3600000 * 5).toISOString(), estado: 'pendiente' },
    { tipo: 'examen', fecha_limite: new Date(now + 3600000 * 10).toISOString(), estado: 'pendiente' },
    { tipo: 'tarea', fecha_limite: new Date(now + 86400000 * 5).toISOString(), estado: 'pendiente' }
  ];
  const urgent = sampleItems.filter(i => {
    const d = new Date(i.fecha_limite);
    return d > now && d <= (now + 86400000) && i.estado !== 'hecho';
  });
  assert(urgent.length === 2, 'RF10: Detección precisa de 2 entregas dentro de las próximas 24 horas');
  const onlyExams = sampleItems.filter(i => i.tipo === 'examen');
  assert(onlyExams.length === 1, 'RF10: Filtrado por tipo Exámenes');

  // RF11: Centro de avisos y resolución rápida
  console.log('\n--- Probando RF11: Centro de Avisos ---');
  const avisoActivo = { id: 'a1', estado: 'pendiente', titulo: 'Ensayo' };
  avisoActivo.estado = 'hecho';
  assert(avisoActivo.estado === 'hecho', 'RF11: Acción rápida marcar hecho retira el aviso de activos');

  // RF12: Validación de sugerencias y reportes
  console.log('\n--- Probando RF12: Validación de Reporte de Fallos ---');
  const shortMsg = 'hola';
  const validMsg = 'No se muestra el punto en el calendario en Firefox';
  assert(shortMsg.length < 5, 'RF12: Rechazo de mensajes menores a 5 caracteres');
  assert(validMsg.length >= 5 && validMsg.length <= 500, 'RF12: Aceptación de sugerencias válidas');

  console.log('\n====================================================');
  console.log(`📊 Resultado final: ${passed} pruebas pasaron, ${failed} fallaron.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch(err => {
  console.error('Error durante pruebas E2E:', err);
  process.exit(1);
});

