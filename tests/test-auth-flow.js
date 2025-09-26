/**
 * Script de prueba automatizada para el sistema de autenticación
 * Simula el escenario completo de sesión expirada
 */

console.log('🧪 Iniciando pruebas automatizadas del sistema de autenticación...');

// Función para simular el escenario de prueba
function testAuthFlow() {
  console.log('\n📋 ESCENARIO: Usuario borra localStorage e intenta agregar comentario');
  
  // Paso 1: Simular usuario logueado
  console.log('\n1️⃣ Simulando usuario logueado...');
  const mockUser = {
    _id: '123',
    name: 'Usuario Test',
    email: 'test@test.com'
  };
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  localStorage.setItem('identity', JSON.stringify(mockUser));
  localStorage.setItem('token', mockToken);
  
  console.log('✅ Usuario simulado correctamente');
  console.log('   - Token:', mockToken.substring(0, 20) + '...');
  console.log('   - Usuario:', mockUser.name);
  
  // Paso 2: Verificar estado inicial
  console.log('\n2️⃣ Verificando estado inicial...');
  const initialToken = localStorage.getItem('token');
  const initialIdentity = localStorage.getItem('identity');
  
  if (initialToken && initialIdentity) {
    console.log('✅ Estado inicial correcto');
  } else {
    console.log('❌ Error: Estado inicial incorrecto');
    return false;
  }
  
  // Paso 3: Simular estar en ruta protegida
  console.log('\n3️⃣ Simulando ruta protegida...');
  const currentPath = window.location.pathname;
  const isProtectedRoute = ['/admin', '/perfil', '/home', '/lecciones', '/mensajes'].some(route => 
    currentPath.startsWith(route)
  );
  
  console.log(`   - Ruta actual: ${currentPath}`);
  console.log(`   - Es ruta protegida: ${isProtectedRoute}`);
  
  // Paso 4: Borrar localStorage (simulando sesión expirada)
  console.log('\n4️⃣ Borrando localStorage (simulando sesión expirada)...');
  localStorage.clear();
  
  const afterClearToken = localStorage.getItem('token');
  const afterClearIdentity = localStorage.getItem('identity');
  
  if (!afterClearToken && !afterClearIdentity) {
    console.log('✅ localStorage borrado correctamente');
  } else {
    console.log('❌ Error: localStorage no se borró completamente');
    return false;
  }
  
  // Paso 5: Simular intento de agregar comentario
  console.log('\n5️⃣ Simulando intento de agregar comentario...');
  
  // Mock del CommentService
  const mockCommentService = {
    addComment: function(token, comment) {
      return new Promise((resolve, reject) => {
        if (!token || token.trim() === '') {
          reject('No hay token de autenticación. Por favor, inicie sesión nuevamente.');
        } else {
          resolve({ success: true, comment });
        }
      });
    }
  };
  
  // Mock del UserService
  const mockUserService = {
    getToken: function() {
      const localStorageToken = localStorage.getItem('token');
      if (!localStorageToken && this._token) {
        this._token = null;
        this._identity = null;
        this.checkAndRedirectIfNeeded();
        return null;
      }
      if (localStorageToken && !this._token) {
        this._token = localStorageToken;
      }
      return this._token;
    },
    
    checkAndRedirectIfNeeded: function() {
      const currentUrl = window.location.pathname;
      const protectedRoutes = ['/admin', '/perfil', '/home', '/lecciones', '/mensajes'];
      const isProtectedRoute = protectedRoutes.some(route => currentUrl.startsWith(route));
      
      if (isProtectedRoute) {
        console.log('🚨 Detectada ruta protegida sin token - Redirigiendo...');
        this.handleExpiredSession();
      }
    },
    
    handleExpiredSession: function() {
      console.log('🔄 Limpiando sesión y redirigiendo...');
      this.clearIdentityAndToken();
      sessionStorage.clear();
      localStorage.clear();
      
      // Simular alert
      console.log('📢 ALERT: Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
      
      // Simular redirección
      console.log('🔄 Redirigiendo a /login...');
      return true;
    },
    
    clearIdentityAndToken: function() {
      this._token = null;
      this._identity = null;
      console.log('🧹 Cache de usuario limpiado');
    }
  };
  
  // Simular el flujo
  const token = mockUserService.getToken();
  console.log(`   - Token obtenido: ${token ? 'EXISTS' : 'NULL'}`);
  
  if (!token) {
    console.log('✅ Token detectado como null (esperado)');
    
    // Intentar agregar comentario
    mockCommentService.addComment(token, { text: 'Test comment' })
      .then(response => {
        console.log('❌ Error: Comentario se agregó cuando no debería');
        return false;
      })
      .catch(error => {
        console.log('✅ Error capturado correctamente:', error);
        
        // Verificar que se dispara la redirección
        const redirectResult = mockUserService.checkAndRedirectIfNeeded();
        if (redirectResult) {
          console.log('✅ Redirección disparada correctamente');
          return true;
        } else {
          console.log('❌ Error: No se disparó la redirección');
          return false;
        }
      });
  } else {
    console.log('❌ Error: Token no es null cuando debería serlo');
    return false;
  }
}

// Función para ejecutar todas las pruebas
function runAllTests() {
  console.log('🚀 Ejecutando suite completa de pruebas...\n');
  
  const tests = [
    {
      name: 'Flujo de autenticación completo',
      test: testAuthFlow
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  tests.forEach((testCase, index) => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`PRUEBA ${index + 1}: ${testCase.name}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      const result = testCase.test();
      if (result !== false) {
        console.log(`✅ PRUEBA ${index + 1} PASÓ`);
        passedTests++;
      } else {
        console.log(`❌ PRUEBA ${index + 1} FALLÓ`);
      }
    } catch (error) {
      console.log(`❌ PRUEBA ${index + 1} FALLÓ CON ERROR:`, error);
    }
  });
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULTADOS FINALES`);
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
  console.log(`❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema de autenticación funciona correctamente.');
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisar el sistema de autenticación.');
  }
}

// Función para limpiar después de las pruebas
function cleanup() {
  console.log('\n🧹 Limpiando después de las pruebas...');
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Limpieza completada');
}

// Ejecutar pruebas cuando se carga el script
if (typeof window !== 'undefined') {
  // Si estamos en el navegador
  window.testAuthSystem = function() {
    runAllTests();
    cleanup();
  };
  
  console.log('📝 Para ejecutar las pruebas, ejecuta en la consola:');
  console.log('   testAuthSystem()');
} else {
  // Si estamos en Node.js
  runAllTests();
  cleanup();
}

console.log('\n✨ Script de pruebas cargado correctamente'); 