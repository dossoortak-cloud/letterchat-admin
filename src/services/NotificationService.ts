// Expo Push Notification Servisi

export const sendPushNotification = async (pushToken: string, title: string, body: string) => {
    const message = {
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: { someData: 'goes here' },
    };

    try {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
            mode: 'no-cors' // 🔥 BU SATIR WEB TARAYICISI HATASINI ÇÖZER
        });
        console.log("Bildirim gönderildi (Tekli)");
    } catch (error) {
        console.error("Bildirim hatası:", error);
    }
};

export const sendBroadcast = async (tokens: string[], title: string, body: string) => {
    const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title: title,
        body: body,
    }));

    try {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
            mode: 'no-cors' // 🔥 BU SATIR KRİTİK!
        });
        console.log("Toplu bildirim gönderildi.");
    } catch (error) {
        console.error("Toplu bildirim hatası:", error);
        alert("Bildirim gönderilemedi. Konsolu kontrol et.");
    }
};