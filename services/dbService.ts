
const DB_NAME = 'AI-Teman-Curhat-DB';
const STORE_NAME = 'images';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject('Error opening DB');
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
                tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const saveImage = async (id: string, data: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ id, data });

            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Error saving image:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error("Transaction error on save:", error);
            reject(error);
        }
    });
};

export const getImage = async (id: string): Promise<string | null> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result ? request.result.data : null);
            };
            request.onerror = () => {
                console.error('Error getting image:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error("Transaction error on get:", error);
            reject(error);
        }
    });
};

export const deleteImage = async (id: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
       try {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Error deleting image:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error("Transaction error on delete:", error);
            reject(error);
        }
    });
};

export const clearImages = async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Error clearing images:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error("Transaction error on clear:", error);
            reject(error);
        }
    });
};
