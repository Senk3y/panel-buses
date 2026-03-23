from flask import Flask, jsonify, request
from flask_cors import CORS
from google.transit import gtfs_realtime_pb2
import requests
import time

app = Flask(__name__)
CORS(app) 

# --- CONFIGURACIÓN ---
AMB_GTFS_URL = "https://www.ambmobilitat.cat/transit/trips-updates/trips.bin" 

# 📖 DICCIONARIO TRADUCTOR DEFINITIVO
TRADUCTOR_LINEAS = {
    "430": "X30",
    "181": "L52",
    "177": "L77"
}

@app.route('/api/amb')
def get_amb_times():
    try:
        parada_pedida = request.args.get('parada')
        if not parada_pedida:
            parada_pedida = "237"
            
        parada_formateada = str(parada_pedida).zfill(6)

        response = requests.get(AMB_GTFS_URL)
        feed = gtfs_realtime_pb2.FeedMessage()
        feed.ParseFromString(response.content)

        buses = []
        current_time = int(time.time())

        for entity in feed.entity:
            if entity.HasField('trip_update'):
                for update in entity.trip_update.stop_time_update:
                    if update.stop_id == parada_formateada:
                        
                        arrival_time = update.arrival.time
                        minutes_left = max(0, int((arrival_time - current_time) / 60))
                        
                        trip_id = entity.trip_update.trip.trip_id
                        prefijo_secreto = trip_id.split('.')[0]
                        
                        nombre_real = TRADUCTOR_LINEAS.get(prefijo_secreto, prefijo_secreto)
                        
                        buses.append({
                            "linea": nombre_real, 
                            "minutos": minutes_left
                        })
                        print(f"✅ Enviando al panel! Parada {parada_formateada} | {nombre_real} -> {minutes_left} min")

        buses = sorted(buses, key=lambda x: x['minutos'])
        return jsonify({"status": "ok", "buses": buses})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Servidor traductor AMB iniciado")
    app.run(port=5000, debug=True)