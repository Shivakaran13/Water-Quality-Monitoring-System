import { useState, useEffect } from "react";
import { getRecentAlertHistory, type AlertLog } from "@/lib/firestore";
import type { AlertItem } from "@/lib/mockData";
import { onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useLiveAlerts(): AlertItem[] {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    // We subscribe to Firestore to get real-time updates when new alerts are logged
    const alertHistoryQuery = query(
      collection(db, "alert_history"),
      orderBy("timestamp", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(alertHistoryQuery, (snapshot) => {
      const fetchedAlerts: AlertItem[] = snapshot.docs.map((doc) => {
        const data = doc.data() as AlertLog;
        const severityStr = data.severity === "warning" ? "high" : "critical"; // Map warning to high for colored badges
        
        // Format timestamp safely
        let formattedTime = "";
        if (data.timestamp?.toDate) {
            formattedTime = data.timestamp.toDate().toLocaleString();
        } else {
            formattedTime = new Date().toLocaleString();
        }

        return {
          id: doc.id,
          parameter: data.parameter,
          severity: severityStr as AlertItem["severity"],
          message: data.message || `${data.parameter} exceeded safe threshold`,
          value: data.value,
          unit: data.unit || "",
          timestamp: formattedTime,
          acknowledged: false,
        };
      });

      setAlerts(fetchedAlerts);
    });

    return () => unsubscribe();
  }, []);

  return alerts;
}
