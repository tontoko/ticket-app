const errorMsg = (e, method?) => {
  console.log(e)
  switch (e.code) {
    case 'auth/cancelled-popup-request':
    case 'auth/popup-closed-by-user':
      return 'ポップアップが閉じられました。'
    case 'auth/email-already-in-use':
      if (method && method.indexOf('signup') !== -1) {
        return 'このメールアドレスは使用されています。'
      } else {
        return 'メールアドレスまたはパスワードが違います。'
      }
    case 'auth/invalid-email':
      return 'メールアドレスが正しくありません。'
    case 'auth/user-disabled':
      return 'サービスの利用が停止されています。'
    case 'auth/user-not-found':
      return 'メールアドレスまたはパスワードが正しくありません。'
    case 'auth/user-mismatch':
      if (method && method === 'signin/popup') {
        return '認証されているユーザーと異なるアカウントです。'
      } else {
        return 'メールアドレスまたはパスワードが正しくありません。'
      }
    case 'auth/weak-password':
      return 'パスワードは6文字以上にしてください。'
    case 'auth/wrong-password':
      return 'メールアドレスまたはパスワードが正しくありません。'
    case 'auth/popup-blocked':
      return 'ポップアップがブロックされました。'
    case 'auth/operation-not-supported-in-this-environment':
    case 'auth/auth-domain-config-required':
    case 'auth/operation-not-allowed':
    case 'auth/unauthorized-domain':
      return '現在この認証方法はご利用頂けません。'
    case 'auth/requires-recent-login':
      return '認証の有効期限が切れています。'
    case 'auth/too-many-requests':
      return '短時間に複数のリクエストを受け取ったためブロックされました。しばらく時間をおいて再度お試しください。'
    default:
      if (method && method.indexOf('signin') !== -1) {
        return '認証に失敗しました。しばらく時間をおいて再度お試しください。'
      }
      return 'エラーが発生しました。しばらく時間をおいてお試しください。'
  }
}

export default errorMsg
