//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/unit/stores/useChatStore.test.js
// 🧩 Type : Test Unitaire Store Chat - VERSION MINIMALE
// 📚 Description : Tests essentiels du store chat (fonctionnalités de base uniquement)
// 🕒 Version : 5.0 - 2025-01-XX - MINIMALE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import { renderHook, act } from '@testing-library/react-native';
import { useChatStore } from '../../../src/stores/useChatStore';

describe('💬 useChatStore - Tests Fonctionnels de Base', () => {
  
  beforeEach(() => {
    // Reset simple via les actions du store
    const { result } = renderHook(() => useChatStore());
    act(() => {
      // Vider les messages
      result.current.messages = [];
      result.current.isTyping = false;
      result.current.isWaitingResponse = false;
      result.current.pendingMessages = [];
    });
  });

  test('✅ devrait initialiser avec état vide', () => {
    const { result } = renderHook(() => useChatStore());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isTyping).toBe(false);
    expect(result.current.isWaitingResponse).toBe(false);
    expect(result.current.pendingMessages).toEqual([]);
  });

  test('✅ devrait ajouter un message utilisateur', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.addUserMessage('Bonjour !');
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].type).toBe('user');
    expect(result.current.messages[0].content).toBe('Bonjour !');
  });

  test('✅ devrait gérer les états de conversation', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.setTyping(true);
    });
    expect(result.current.isTyping).toBe(true);
    
    act(() => {
      result.current.setWaitingResponse(true);
    });
    expect(result.current.isWaitingResponse).toBe(true);
  });
}); 