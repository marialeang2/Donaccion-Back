import requests
import json
import random
import time
from datetime import datetime, timedelta
from faker import Faker

# Configuración
BASE_URL = "http://localhost:3001/api"
# Corregido: la autenticación está en /auth, no en /api/auth
AUTH_URL = f"{BASE_URL}/auth"
headers = {"Content-Type": "application/json"}
# Será actualizado con el token JWT
auth_headers = {"Content-Type": "application/json"}
fake = Faker(['es_ES', 'es_MX'])  # Generador para español

# Número de entidades a crear
NUM_REGULAR_USERS = 20
NUM_FOUNDATION_USERS = 10
DONATIONS_PER_USER = 3
SOCIAL_ACTIONS_PER_FOUNDATION = 4
COMMENTS_PER_ENTITY = 2
MAX_RATINGS = 15
PARTICIPATION_REQUESTS = 30
CERTIFICATES = 15
NOTIFICATIONS = 40
SUGGESTIONS = 25
FAVORITES_PER_USER = 5

# Almacenamiento para IDs y otros datos
users = []  # Lista de diccionarios con info de usuarios
admin_token = None  # Token JWT para administrador
user_tokens = {}  # Diccionario de tokens JWT por usuario_id
foundations = []  # Lista de diccionarios con info de fundaciones
donations = []  # Lista de IDs de donaciones
social_actions = []  # Lista de IDs de acciones sociales
comments = []  # Lista de IDs de comentarios
ratings = []  # Lista de IDs de calificaciones
participation_requests = []  # Lista de IDs de solicitudes
certificates = []  # Lista de IDs de certificados
notifications = []  # Lista de IDs de notificaciones
suggestions = []  # Lista de IDs de sugerencias
favorites = []  # Lista de IDs de favoritos

# Datos realistas para fundaciones
foundation_prefixes = [
    "Fundación", "Asociación", "ONG", "Organización", "Red", "Movimiento",
    "Alianza", "Colectivo", "Centro", "Instituto"
]

foundation_themes = [
    "Ambiental", "Educativa", "Social", "Humanitaria", "para el Desarrollo",
    "Comunitaria", "Solidaria", "Juvenil", "Cultural", "Ecológica",
    "de Ayuda", "de Apoyo", "de Bienestar", "de Protección"
]

foundation_focuses = [
    "Niños", "Jóvenes", "Mujeres", "Animales", "Selvas", "Océanos",
    "Educación", "Salud", "Cultura", "Tecnología", "Ciencia", "Arte",
    "Deporte", "Vivienda", "Alimentación", "Agua Potable", "Energías Limpias",
    "Adultos Mayores", "Comunidades Indígenas", "Migrantes", "Inclusión"
]

# Descripciones realistas para acciones sociales
social_action_types = [
    "Campaña de limpieza en", "Jornada de reforestación en", "Taller educativo sobre",
    "Construcción de viviendas en", "Distribución de alimentos a",
    "Campaña de vacunación en", "Maratón solidario para", "Capacitación en",
    "Instalación de sistemas de agua en", "Programa de alfabetización en",
    "Feria solidaria para", "Seminario sobre", "Implementación de huertos comunitarios en",
    "Rescate y rehabilitación de", "Restauración de áreas naturales en"
]

social_action_locations = [
    "la comunidad de San Juan", "el barrio Las Flores", "la escuela primaria Benito Juárez",
    "la costa de Veracruz", "el bosque de Chapultepec", "la reserva natural Sierra Gorda",
    "el Centro Comunitario Esperanza", "la zona rural de Oaxaca", "el hospital infantil",
    "la universidad pública", "las áreas afectadas por el terremoto",
    "la colonia Nueva Vida", "el parque municipal", "la biblioteca pública",
    "la zona arqueológica"
]

social_action_details = [
    "con voluntarios locales", "en colaboración con el gobierno municipal",
    "con apoyo de empresas locales", "con participación ciudadana",
    "dirigido a familias de bajos recursos", "para niños en situación vulnerable",
    "con donaciones de la comunidad internacional", "con materiales reciclados",
    "aplicando tecnologías sustentables", "para fortalecer la economía local",
    "con un enfoque en la conservación de especies nativas", "con metodologías innovadoras",
    "para fomentar el desarrollo comunitario", "con enfoque de género",
    "para promover la cultura de paz"
]

# Comentarios para donaciones y acciones sociales
donation_comments = [
    "¡Feliz de poder contribuir a esta noble causa!",
    "Espero que mi donación ayude a alcanzar sus objetivos.",
    "Gracias por el trabajo que realizan, sigan adelante.",
    "Mi pequeña contribución para un mundo mejor.",
    "Es inspirador ver el impacto que tienen en la comunidad.",
    "Donen también y juntos podemos hacer la diferencia.",
    "Primera vez que dono a esta fundación, pero no será la última.",
    "Impresionado por la transparencia en el uso de los fondos.",
    "Mi familia y yo estamos comprometidos con su labor.",
    "Orgulloso de apoyar iniciativas que realmente generan cambio."
]

foundation_comments = [
    "Esta fundación está haciendo un trabajo excepcional en la comunidad.",
    "He colaborado con ellos varias veces y siempre ha sido una experiencia positiva.",
    "Me encanta su compromiso con la transparencia y cómo informan sobre el uso de las donaciones.",
    "Sus programas tienen un impacto real y medible, lo recomendaría a cualquiera.",
    "La atención y el trato que brindan a los voluntarios es excelente.",
    "Su enfoque innovador para resolver problemas sociales es admirable.",
    "Me gustaría saber si tienen programas para voluntarios a tiempo parcial.",
    "¿Podría alguien informarme sobre cómo puedo involucrarme más con esta fundación?",
    "Gracias por su labor constante en beneficio de los más necesitados.",
    "Su trabajo en educación/conservación/derechos humanos es realmente inspirador."
]


social_action_comments = [
    "Me encantaría participar en esta iniciativa.",
    "¿Hay posibilidad de unirse como voluntario?",
    "Excelente proyecto, muy necesario para la comunidad.",
    "¿Cuándo será la próxima actividad similar?",
    "Ya participé en un evento anterior y fue una experiencia transformadora.",
    "¿Qué requisitos hay para formar parte del equipo?",
    "Difundiré esta acción en mis redes sociales.",
    "¿Aceptan donaciones de materiales o solo monetarias?",
    "Felicitaciones por organizar esto, hacen falta más iniciativas así.",
    "¡Iniciativas como esta son las que cambian al mundo!"
]

# Sugerencias para la plataforma
suggestions_list = [
    "Sería útil tener una opción para donaciones recurrentes mensuales.",
    "Me gustaría poder filtrar las acciones sociales por ubicación geográfica.",
    "Sugiero añadir la posibilidad de compartir directamente en redes sociales.",
    "Sería bueno poder ver un historial completo de mis donaciones con recibos descargables.",
    "¿Podrían implementar un sistema de recordatorios para acciones sociales?",
    "Sugiero añadir la opción de donar en otras monedas internacionales.",
    "Me encantaría ver galerías de fotos de las acciones sociales realizadas.",
    "Sería útil tener un chat en vivo para resolver dudas sobre las fundaciones.",
    "¿Podrían añadir un mapa interactivo con la ubicación de las fundaciones y acciones?",
    "Sugiero implementar un sistema de niveles para donantes frecuentes.",
    "Sería bueno tener una sección de testimonios de beneficiarios.",
    "¿Podrían añadir un blog con historias de éxito y noticias relevantes?",
    "Sugiero notificaciones push para informar sobre emergencias que requieren ayuda urgente.",
    "Me gustaría poder crear equipos de donación con amigos y familia.",
    "Sería útil tener una calculadora de impacto que muestre el efecto de cada donación."
]

# Certificados para usuarios
certificate_descriptions = [
    "Certificado de voluntariado en campañas de reforestación",
    "Reconocimiento por apoyo constante a programas educativos",
    "Certificado de participación en construcción de viviendas",
    "Reconocimiento por donaciones sobresalientes",
    "Certificado de participación en campañas de salud comunitaria",
    "Reconocimiento por labor voluntaria con adultos mayores",
    "Certificado de capacitación en primeros auxilios",
    "Reconocimiento por participación en jornadas de limpieza",
    "Certificado de colaboración en programas de alfabetización",
    "Reconocimiento por apoyo a iniciativas de inclusión",
    "Certificado de voluntariado en comedores comunitarios",
    "Reconocimiento por participación en festivales culturales",
    "Certificado de asistencia a talleres de desarrollo sostenible",
    "Reconocimiento por apoyo a proyectos de conservación ambiental",
    "Certificado de participación en brigadas de ayuda humanitaria"
]


def print_status(message, success=True):
    """Imprime mensajes de estado con formato"""
    if success:
        print(f"✅ {message}")
    else:
        print(f"❌ {message}")


def login_user(email, password):
    """Inicia sesión y obtiene token JWT"""
    login_data = {
        "email": email,
        "password": password
    }

    try:
        # Corregido: Usar la URL de autenticación correcta
        response = requests.post(
            f"{AUTH_URL}/login", json=login_data, headers=headers)

        # Imprime para diagnóstico
        if response.status_code == 200 or response.status_code == 201:
            token_data = response.json()
            token = token_data.get('access_token')
            if token:
                print_status(f"Inicio de sesión exitoso para: {email}")
                return token
            else:
                print_status(
                    f"Token no encontrado en respuesta: {response.text}", False)
                return None
        else:
            print_status(
                f"Error al iniciar sesión ({response.status_code}): {response.text}", False)
            return None
    except Exception as e:
        print_status(f"Error de conexión en login: {str(e)}", False)
        return None


def get_auth_headers(user_id=None):
    """Obtiene los headers con el token JWT"""
    if user_id and user_id in user_tokens:
        token = user_tokens[user_id]
    elif admin_token:
        token = admin_token
    else:
        return headers  # Sin token, retornar headers básicos

    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }


def create_users():
    """Crear usuarios regulares y fundaciones"""
    global users, admin_token, user_tokens

    print("\n=== Creando usuarios regulares ===")

    # Crear un usuario admin primero para facilitar operaciones
    admin_data = {
        "name": "Administrador",
        "email": "admin@ejemplo.com",
        "password": "Password123",
        "user_type": "foundation"  # Admin como fundación
    }

    try:
        # Corregido: usar /register para el admin también
        response = requests.post(
            f"{BASE_URL}/users", json=admin_data, headers=headers)

        if response.status_code in [200, 201]:
            admin_info = response.json()
            users.append(admin_info)
            print_status(f"Usuario administrador creado: {admin_info['name']}")

            # Iniciar sesión con el admin para obtener token
            admin_token = login_user(
                admin_data["email"], admin_data["password"])
            if admin_token:
                user_tokens[admin_info["id"]] = admin_token
                print_status("Administrador autenticado con éxito")
            else:
                print_status("Error al autenticar administrador", False)
        else:
            print_status(
                f"Error al crear administrador: {response.text}", False)
    except Exception as e:
        print_status(f"Error de conexión: {str(e)}", False)

    for i in range(NUM_REGULAR_USERS):
        # Generar datos de usuario regular
        first_name = fake.first_name()
        last_name = fake.last_name()
        email = fake.email()
        password = "Password123"

        user_data = {
            "name": f"{first_name} {last_name}",
            "email": email,
            "password": password,
            "user_type": "user"
        }

        try:
            response = requests.post(
                f"{BASE_URL}/users", json=user_data, headers=headers)

            if response.status_code in [200, 201]:
                user_info = response.json()
                # Guardar para uso posterior
                user_info['first_name'] = first_name
                # Guardar contraseña para autenticación
                user_info['password'] = password
                users.append(user_info)

                # Obtener token JWT para el usuario
                token = login_user(email, password)
                if token:
                    user_tokens[user_info["id"]] = token
                    print_status(f"Token guardado para: {user_info['name']}")

                print_status(f"Usuario regular creado: {user_info['name']}")
            else:
                print_status(
                    f"Error al crear usuario regular: {response.text}", False)
        except Exception as e:
            print_status(f"Error de conexión: {str(e)}", False)

    print("\n=== Creando usuarios de fundaciones ===")

    for i in range(NUM_FOUNDATION_USERS):
        # Generar datos de usuario de fundación
        foundation_name = f"{random.choice(foundation_prefixes)} {random.choice(foundation_themes)} {random.choice(foundation_focuses)}"
        email = fake.company_email()
        password = "Password123"

        user_data = {
            "name": foundation_name,
            "email": email,
            "password": password,
            "user_type": "foundation"
        }

        try:
            response = requests.post(
                f"{BASE_URL}/register", json=user_data, headers=headers)

            if response.status_code in [200, 201]:
                user_info = response.json()
                # Guardar para uso posterior
                user_info['foundation_name'] = foundation_name
                # Guardar contraseña para autenticación
                user_info['password'] = password
                users.append(user_info)

                # Obtener token JWT para el usuario
                token = login_user(email, password)
                if token:
                    user_tokens[user_info["id"]] = token
                    print_status(f"Token guardado para: {user_info['name']}")

                print_status(
                    f"Usuario de fundación creado: {user_info['name']}")
            else:
                print_status(
                    f"Error al crear usuario de fundación: {response.text}", False)
        except Exception as e:
            print_status(f"Error de conexión: {str(e)}", False)


def create_foundations():
    """Crear perfil de fundación para usuarios de tipo fundación"""
    global foundations

    print("\n=== Creando perfiles de fundaciones ===")

    foundation_users = [
        user for user in users if user["user_type"] == "foundation"]

    for user in foundation_users:
        # Generar datos de la fundación
        foundation_data = {
            "user_id": user["id"],
            "legal_name": user.get("foundation_name", user["name"]),
            "address": fake.address(),
            "phone": fake.phone_number(),
            "website": f"https://www.{user['name'].lower().replace(' ', '')}.org"
        }

        try:
            # Asegurarse de que tenemos un token para este usuario
            if user["id"] not in user_tokens:
                print_status(
                    f"No hay token para {user['name']}, intentando login", False)
                token = login_user(user["email"], user["password"])
                if token:
                    user_tokens[user["id"]] = token
                else:
                    print_status(
                        f"No se pudo obtener token para {user['name']}", False)
                    continue

            user_auth_headers = get_auth_headers(user["id"])
            print_status(f"Creando fundación para {user['name']} con token")

            response = requests.post(
                f"{BASE_URL}/foundations", json=foundation_data, headers=user_auth_headers)

            if response.status_code in [200, 201]:
                foundation_info = response.json()
                foundations.append(foundation_info)
                print_status(
                    f"Perfil de fundación creado: {foundation_info['legal_name']}")
            else:
                print_status(
                    f"Error al crear perfil de fundación: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error de conexión: {str(e)}", False)


def create_donations():
    """Crear donaciones de usuarios regulares a fundaciones"""
    global donations

    print("\n=== Creando donaciones ===")

    regular_users = [user for user in users if user["user_type"] == "user"]

    if not foundations:
        print_status("No hay fundaciones para recibir donaciones", False)
        return

    for user in regular_users:
        # Decidir cuántas donaciones hará este usuario
        num_donations = random.randint(1, DONATIONS_PER_USER)

        for _ in range(num_donations):
            # Seleccionar una fundación aleatoria
            foundation = random.choice(foundations)

            # Generar monto de donación (entre 10 y 1000)
            amount = round(random.uniform(10, 1000), 2)

            donation_data = {
                "user_id": user["id"],
                "foundation_id": foundation["id"],
                "amount": amount
            }

            try:
                # Asegurarse de tener un token para este usuario
                if user["id"] not in user_tokens:
                    token = login_user(user["email"], user["password"])
                    if token:
                        user_tokens[user["id"]] = token
                    else:
                        print_status(
                            f"No se pudo obtener token para {user['name']}", False)
                        continue

                user_auth_headers = get_auth_headers(user["id"])
                response = requests.post(
                    f"{BASE_URL}/donations", json=donation_data, headers=user_auth_headers)

                if response.status_code in [200, 201]:
                    donation_info = response.json()
                    donations.append(donation_info)
                    print_status(
                        f"Donación creada: ${amount} a {foundation['legal_name']}")
                else:
                    print_status(
                        f"Error al crear donación: {response.status_code} - {response.text}", False)
            except Exception as e:
                print_status(f"Error de conexión: {str(e)}", False)


def create_social_actions():
    """Crear acciones sociales para las fundaciones"""
    global social_actions

    print("\n=== Creando acciones sociales ===")

    if not foundations:
        print_status("No hay fundaciones para crear acciones sociales", False)
        return

    for foundation in foundations:
        # Obtener el user_id asociado a la fundación
        foundation_user_id = foundation["user_id"]

        # Decidir cuántas acciones sociales creará esta fundación
        num_actions = random.randint(1, SOCIAL_ACTIONS_PER_FOUNDATION)

        for _ in range(num_actions):
            # Generar fechas coherentes
            today = datetime.now()

            # Decidir si la acción está en el futuro, en curso o ya terminó
            action_status = random.choice(["future", "current", "past"])

            if action_status == "future":
                # Acción futura
                start_date = today + timedelta(days=random.randint(5, 60))
                end_date = start_date + timedelta(days=random.randint(1, 14))
            elif action_status == "current":
                # Acción en curso
                start_date = today - timedelta(days=random.randint(1, 10))
                end_date = today + timedelta(days=random.randint(1, 20))
            else:
                # Acción pasada
                end_date = today - timedelta(days=random.randint(5, 60))
                start_date = end_date - timedelta(days=random.randint(1, 14))

            # Generar descripción de la acción social
            description = f"{random.choice(social_action_types)} {random.choice(social_action_locations)} {random.choice(social_action_details)}"

            social_action_data = {
                "foundation_id": foundation["id"],
                "description": description,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }

            try:
                # Asegurarse de tener un token para el usuario de la fundación
                if foundation_user_id not in user_tokens:
                    # Buscar el usuario de la fundación
                    foundation_user = next(
                        (u for u in users if u["id"] == foundation_user_id), None)
                    if foundation_user:
                        token = login_user(
                            foundation_user["email"], foundation_user["password"])
                        if token:
                            user_tokens[foundation_user_id] = token
                        else:
                            print_status(
                                f"No se pudo obtener token para la fundación", False)
                            continue
                    else:
                        print_status(
                            "Usuario de fundación no encontrado", False)
                        continue

                # Usar el token de la fundación
                user_auth_headers = get_auth_headers(foundation_user_id)

                # Aleatoriamente usar /social-actions o /opportunities para variedad
                endpoint = random.choice(
                    [f"{BASE_URL}/social-actions", f"{BASE_URL}/opportunities"])

                response = requests.post(
                    endpoint, json=social_action_data, headers=user_auth_headers)

                if response.status_code in [200, 201]:
                    action_info = response.json()
                    social_actions.append(action_info)
                    print_status(
                        f"Acción social creada: {description[:50]}...")
                else:
                    print_status(
                        f"Error al crear acción social: {response.status_code} - {response.text}", False)
            except Exception as e:
                print_status(f"Error de conexión: {str(e)}", False)


def create_comments():
    """Crear comentarios para donaciones y acciones sociales"""
    global comments

    print("\n=== Creando comentarios para donaciones ===")

    if not donations:
        print_status("No hay donaciones para crear comentarios", False)
    else:
        # Comentarios para donaciones
        for donation in donations[:COMMENTS_PER_ENTITY * 3]:
            # Para cada donación, el comentario debe ser del usuario donante o de la fundación
            # Primero, intentamos con el usuario donante
            user_id = donation.get('user_id')
            foundation_id = donation.get('foundation_id')

            if not user_id:
                continue  # Si no hay user_id, saltamos esta donación

            # Buscar el usuario
            user = next((u for u in users if u["id"] == user_id), None)

            if not user:
                continue  # Si no encontramos el usuario, saltamos esta donación

            comment_data = {
                "user_id": user_id,
                "donation_id": donation["id"],
                "text": random.choice(donation_comments)
            }

            try:
                # Asegurarse de tener un token para este usuario
                if user_id not in user_tokens:
                    token = login_user(user["email"], user["password"])
                    if token:
                        user_tokens[user_id] = token
                    else:
                        continue

                user_auth_headers = get_auth_headers(user_id)
                response = requests.post(
                    f"{BASE_URL}/comments", json=comment_data, headers=user_auth_headers)

                if response.status_code in [200, 201]:
                    comment_info = response.json()
                    comments.append(comment_info)
                    print_status(f"Comentario creado para donación")
                else:
                    print_status(
                        f"Error al crear comentario: {response.status_code} - {response.text}", False)
            except Exception as e:
                print_status(f"Error de conexión: {str(e)}", False)

    print("\n=== Creando comentarios para acciones sociales ===")

    if not social_actions:
        print_status("No hay acciones sociales para crear comentarios", False)
    else:
        # Para las acciones sociales, necesitamos primero asegurarnos que haya participaciones aceptadas
        for action in social_actions[:COMMENTS_PER_ENTITY * 2]:
            # Buscar la fundación asociada
            foundation_id = action.get('foundation_id')
            if not foundation_id:
                continue

            foundation = next(
                (f for f in foundations if f["id"] == foundation_id), None)
            if not foundation:
                continue

            # Conseguir el user_id de la fundación
            foundation_user_id = foundation.get("user_id")
            if not foundation_user_id:
                continue

            # Buscar el usuario de la fundación
            foundation_user = next(
                (u for u in users if u["id"] == foundation_user_id), None)
            if not foundation_user:
                continue

            comment_data = {
                "user_id": foundation_user_id,
                "social_action_id": action["id"],
                "text": random.choice(social_action_comments)
            }

            try:
                # Asegurarse de tener un token para este usuario
                if foundation_user_id not in user_tokens:
                    token = login_user(
                        foundation_user["email"], foundation_user["password"])
                    if token:
                        user_tokens[foundation_user_id] = token
                    else:
                        continue

                user_auth_headers = get_auth_headers(foundation_user_id)
                response = requests.post(
                    f"{BASE_URL}/comments", json=comment_data, headers=user_auth_headers)

                if response.status_code in [200, 201]:
                    comment_info = response.json()
                    comments.append(comment_info)
                    print_status(
                        f"Comentario creado para acción social desde fundación")
                else:
                    print_status(
                        f"Error al crear comentario: {response.status_code} - {response.text}", False)
            except Exception as e:
                print_status(f"Error de conexión: {str(e)}", False)
    print("\n=== Creando comentarios para fundaciones ===")

    if not foundations:
        print_status("No hay fundaciones para crear comentarios", False)
    else:
        # Comentarios para fundaciones
        regular_users = [user for user in users if user["user_type"] == "user"]
        if not regular_users:
            print_status(
                "No hay usuarios para crear comentarios de fundaciones", False)
            return

        for foundation in foundations[:COMMENTS_PER_ENTITY * 2]:
            # Para cada fundación, seleccionamos un usuario regular aleatorio para comentar
            user = random.choice(regular_users)

            comment_data = {
                "user_id": user["id"],
                "foundation_id": foundation["id"],
                "text": random.choice(foundation_comments)
            }

            try:
                # Asegurarse de tener un token para este usuario
                if user["id"] not in user_tokens:
                    token = login_user(user["email"], user["password"])
                    if token:
                        user_tokens[user["id"]] = token
                    else:
                        continue

                user_auth_headers = get_auth_headers(user["id"])

                # 50% de probabilidad de usar el endpoint normal, 50% el endpoint específico
                if random.random() < 0.5:
                    # Usar endpoint general de comentarios
                    response = requests.post(
                        f"{BASE_URL}/comments", json=comment_data, headers=user_auth_headers)
                else:
                    # Usar nuevo endpoint específico para comentarios de fundaciones
                    response = requests.post(
                        f"{BASE_URL}/foundation-detail/comment", json=comment_data, headers=user_auth_headers)

                if response.status_code in [200, 201]:
                    comment_info = response.json()
                    comments.append(comment_info)
                    print_status(
                        f"Comentario creado para fundación: {foundation['legal_name'][:20]}...")
                else:
                    print_status(
                        f"Error al crear comentario para fundación: {response.status_code} - {response.text}", False)
            except Exception as e:
                print_status(f"Error de conexión: {str(e)}", False)


def create_ratings():
    """Crear calificaciones para donaciones y acciones sociales"""
    global ratings

    print("\n=== Creando calificaciones para donaciones ===")

    if not donations:
        print_status("No hay donaciones para crear calificaciones", False)
    else:
        # Para cada donación, solo el donante puede calificar
        for donation in donations[:MAX_RATINGS]:
            user_id = donation.get('user_id')
            if not user_id:
                continue

            user = next((u for u in users if u["id"] == user_id), None)
            if not user:
                continue

            rating_data = {
                "user_id": user_id,
                "donation_id": donation["id"],
                "rating": random.randint(3, 5)  # Tendencia positiva
            }

            try:
                # Asegurarse de tener un token para este usuario
                if user_id not in user_tokens:
                    token = login_user(user["email"], user["password"])
                    if token:
                        user_tokens[user_id] = token
                    else:
                        continue

                user_auth_headers = get_auth_headers(user_id)
                response = requests.post(
                    f"{BASE_URL}/ratings", json=rating_data, headers=user_auth_headers)

                if response.status_code in [200, 201]:
                    rating_info = response.json()
                    ratings.append(rating_info)
                    print_status(
                        f"Calificación {rating_data['rating']} creada para donación")
                else:
                    print_status(
                        f"Error al crear calificación: {response.status_code} - {response.text}", False)
            except Exception as e:
                print_status(f"Error de conexión: {str(e)}", False)


def create_participation_requests():
    """Crear solicitudes de participación en acciones sociales"""
    global participation_requests

    print("\n=== Creando solicitudes de participación ===")

    regular_users = [user for user in users if user["user_type"] == "user"]

    if not social_actions or not regular_users:
        print_status(
            "No hay acciones sociales o usuarios para crear solicitudes", False)
        return

    # Filtrar acciones sociales que no han terminado
    valid_actions = []
    now = datetime.now()

    for action in social_actions:
        try:
            end_date = datetime.fromisoformat(
                action["end_date"].replace('Z', '+00:00'))
            if end_date > now:
                valid_actions.append(action)
        except (KeyError, ValueError):
            # Si hay problemas con la fecha, asumimos que es válida
            valid_actions.append(action)

    if not valid_actions:
        print_status(
            "No hay acciones sociales vigentes para solicitar participación", False)
        return

    for _ in range(min(PARTICIPATION_REQUESTS, len(regular_users) * len(valid_actions))):
        # Seleccionar un usuario y acción aleatorios
        user = random.choice(regular_users)
        action = random.choice(valid_actions)

        # 50% de probabilidad de usar el endpoint normal, 50% el endpoint de oportunidades
        if random.random() < 0.5:
            # Usar endpoint normal de solicitudes
            request_data = {
                "user_id": user["id"],
                "social_action_id": action["id"]
            }

            try:
                # Asegurarse de tener un token para este usuario
                if user["id"] not in user_tokens:
                    token = login_user(user["email"], user["password"])
                    if token:
                        user_tokens[user["id"]] = token
                    else:
                        print_status(
                            f"No se pudo obtener token para {user['name']}", False)
                        continue

                user_auth_headers = get_auth_headers(user["id"])
                response = requests.post(
                    f"{BASE_URL}/participation-requests", json=request_data, headers=user_auth_headers)

                if response.status_code in [200, 201]:
                    request_info = response.json()
                    participation_requests.append(request_info)
                    print_status(
                        f"Solicitud de participación creada (endpoint normal)")

                    # Para algunas solicitudes, cambiar el estado
                    if random.random() < 0.7:  # 70% de probabilidad
                        status = random.choice(["accepted", "rejected"])
                        update_data = {"status": status}

                        # Necesitamos token de administrador/fundación para aprobar/rechazar
                        # Buscar el usuario de la fundación asociada a la acción social
                        foundation_id = action.get("foundation_id")
                        if foundation_id:
                            foundation = next(
                                (f for f in foundations if f["id"] == foundation_id), None)
                            if foundation:
                                foundation_user_id = foundation.get("user_id")
                                if foundation_user_id and foundation_user_id in user_tokens:
                                    admin_auth_headers = get_auth_headers(
                                        foundation_user_id)
                                    update_response = requests.patch(
                                        f"{BASE_URL}/participation-requests/{request_info['id']}",
                                        json=update_data,
                                        headers=admin_auth_headers
                                    )

                                    if update_response.status_code in [200, 201]:
                                        print_status(f"Solicitud {status}")
                                    else:
                                        print_status(
                                            f"Error al actualizar solicitud: {update_response.status_code} - {update_response.text}", False)
                else:
                    if "already exists" in response.text:
                        print_status(f"Solicitud ya existe (normal)", False)
                    else:
                        print_status(
                            f"Error al crear solicitud: {response.status_code} - {response.text}", False)
            except Exception as e:
                print_status(f"Error de conexión: {str(e)}", False)
        else:
            # Usar endpoint de oportunidades para aplicar
            try:
                # Asegurarse de tener un token para este usuario
                if user["id"] not in user_tokens:
                    token = login_user(user["email"], user["password"])
                    if token:
                        user_tokens[user["id"]] = token
                    else:
                        print_status(
                            f"No se pudo obtener token para {user['name']}", False)
                        continue

                user_auth_headers = get_auth_headers(user["id"])
                response = requests.post(
                    f"{BASE_URL}/opportunities/{action['id']}/apply",
                    json={"message": "Me gustaría participar en esta actividad"},
                    headers=user_auth_headers
                )

                if response.status_code in [200, 201]:
                    request_info = response.json()
                    participation_requests.append(request_info)
                    print_status(
                        f"Solicitud de participación creada (endpoint opportunities)")

                    # Para algunas solicitudes, cambiar el estado
                    if random.random() < 0.7:  # 70% de probabilidad
                        status = random.choice(["accepted", "rejected"])
                        update_data = {"status": status}

                        # Necesitamos token de administrador/fundación para aprobar/rechazar
                        # Buscar el usuario de la fundación asociada a la acción social
                        foundation_id = action.get("foundation_id")
                        if foundation_id:
                            foundation = next(
                                (f for f in foundations if f["id"] == foundation_id), None)
                            if foundation:
                                foundation_user_id = foundation.get("user_id")
                                if foundation_user_id and foundation_user_id in user_tokens:
                                    admin_auth_headers = get_auth_headers(
                                        foundation_user_id)
                                    update_response = requests.patch(
                                        f"{BASE_URL}/participation-requests/{request_info['id']}",
                                        json=update_data,
                                        headers=admin_auth_headers
                                    )

                                    if update_response.status_code in [200, 201]:
                                        print_status(f"Solicitud {status}")
                                    else:
                                        print_status(
                                            f"Error al actualizar solicitud: {update_response.status_code} - {update_response.text}", False)
                else:
                    if "already" in response.text.lower():
                        print_status(
                            f"Solicitud ya existe (opportunities)", False)
                    else:
                        print_status(
                            f"Error al crear solicitud: {response.status_code} - {response.text}", False)
            except Exception as e:
                print_status(f"Error de conexión: {str(e)}", False)


def create_certificates():
    """Crear certificados para usuarios"""
    global certificates

    print("\n=== Creando certificados ===")

    regular_users = [user for user in users if user["user_type"] == "user"]

    if not regular_users:
        print_status("No hay usuarios para crear certificados", False)
        return

    # Necesitamos un token de fundación para crear certificados
    foundation_user = next(
        (user for user in users if user["user_type"] == "foundation"), None)

    if not foundation_user:
        print_status("No hay fundación para crear certificados", False)
        return

    # Asegurarse de tener un token para la fundación
    if foundation_user["id"] not in user_tokens:
        token = login_user(
            foundation_user["email"], foundation_user["password"])
        if token:
            user_tokens[foundation_user["id"]] = token
        else:
            print_status(f"No se pudo obtener token para la fundación", False)
            return

    foundation_auth_headers = get_auth_headers(foundation_user["id"])

    for _ in range(min(CERTIFICATES, len(regular_users) * 2)):
        # Seleccionar un usuario aleatorio
        user = random.choice(regular_users)

        certificate_data = {
            "user_id": user["id"],
            "description": random.choice(certificate_descriptions)
        }

        try:
            response = requests.post(
                f"{BASE_URL}/certificates", json=certificate_data, headers=foundation_auth_headers)

            if response.status_code in [200, 201]:
                certificate_info = response.json()
                certificates.append(certificate_info)
                print_status(
                    f"Certificado creado: {certificate_data['description'][:30]}...")
            else:
                print_status(
                    f"Error al crear certificado: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error de conexión: {str(e)}", False)


def create_notifications():
    """Crear notificaciones para usuarios"""
    global notifications

    print("\n=== Creando notificaciones ===")

    all_users = users  # Tanto regulares como fundaciones pueden recibir notificaciones

    if not all_users:
        print_status("No hay usuarios para crear notificaciones", False)
        return

    # Necesitamos un token de fundación para crear notificaciones para otros
    foundation_user = next(
        (user for user in users if user["user_type"] == "foundation"), None)

    if not foundation_user:
        print_status("No hay fundación para crear notificaciones", False)
        return

    # Asegurarse de tener un token para la fundación
    if foundation_user["id"] not in user_tokens:
        token = login_user(
            foundation_user["email"], foundation_user["password"])
        if token:
            user_tokens[foundation_user["id"]] = token
        else:
            print_status(f"No se pudo obtener token para la fundación", False)
            return

    foundation_auth_headers = get_auth_headers(foundation_user["id"])

    notification_templates = [
        "¡Nueva acción social disponible cerca de ti!",
        "Tu donación ha sido recibida con éxito.",
        "Una fundación ha respondido a tu comentario.",
        "Tu solicitud de participación ha sido aceptada.",
        "¡Felicidades! Has recibido un nuevo certificado.",
        "Han valorado positivamente tu comentario.",
        "Una acción social que te interesa comienza pronto.",
        "Se ha añadido un nuevo método de donación.",
        "Actualización importante sobre una acción social.",
        "Recordatorio: Evento de voluntariado mañana.",
        "¡Gracias por tu apoyo constante!",
        "Una fundación ha publicado nuevas fotos.",
        "¡Has completado tu primer año como colaborador!",
        "Alguien ha comentado en una donación tuya.",
        "Se han actualizado nuestros términos de servicio."
    ]

    for _ in range(min(NOTIFICATIONS, len(all_users) * 3)):
        # Seleccionar un usuario aleatorio
        user = random.choice(all_users)

        # Decidir si la notificación ya fue leída
        read_status = random.random() < 0.4  # 40% de probabilidad de que esté leída

        notification_data = {
            "user_id": user["id"],
            "message": random.choice(notification_templates),
            "read": read_status
        }

        try:
            response = requests.post(
                f"{BASE_URL}/notifications", json=notification_data, headers=foundation_auth_headers)

            if response.status_code in [200, 201]:
                notification_info = response.json()
                notifications.append(notification_info)
                print_status(f"Notificación creada para {user['name']}")
            else:
                print_status(
                    f"Error al crear notificación: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error de conexión: {str(e)}", False)


def create_suggestions():
    """Crear sugerencias de usuarios"""
    global suggestions

    print("\n=== Creando sugerencias ===")

    regular_users = [user for user in users if user["user_type"] == "user"]

    if not regular_users:
        print_status("No hay usuarios para crear sugerencias", False)
        return

    for _ in range(min(SUGGESTIONS, len(regular_users) * 2)):
        # Seleccionar un usuario aleatorio
        user = random.choice(regular_users)

        # Asegurarse de tener un token para este usuario
        if user["id"] not in user_tokens:
            token = login_user(user["email"], user["password"])
            if token:
                user_tokens[user["id"]] = token
            else:
                print_status(
                    f"No se pudo obtener token para {user['name']}", False)
                continue

        user_auth_headers = get_auth_headers(user["id"])

        # Decidir si la sugerencia ya fue procesada
        # 30% de probabilidad de que esté procesada
        processed_status = random.random() < 0.3

        suggestion_data = {
            "user_id": user["id"],
            "content": random.choice(suggestions_list),
            "processed": processed_status
        }

        try:
            response = requests.post(
                f"{BASE_URL}/suggestions", json=suggestion_data, headers=user_auth_headers)

            if response.status_code in [200, 201]:
                suggestion_info = response.json()
                suggestions.append(suggestion_info)
                print_status(
                    f"Sugerencia creada: {suggestion_data['content'][:30]}...")

                # Si ya estaba marcada como procesada, actualizarla
                if processed_status:
                    # Necesitamos token de fundación para marcar como procesada
                    foundation_user = next(
                        (u for u in users if u["user_type"] == "foundation"), None)
                    if foundation_user and foundation_user["id"] in user_tokens:
                        foundation_auth_headers = get_auth_headers(
                            foundation_user["id"])
                        process_response = requests.patch(
                            f"{BASE_URL}/suggestions/{suggestion_info['id']}/process",
                            headers=foundation_auth_headers
                        )

                        if process_response.status_code in [200, 201]:
                            print_status(f"Sugerencia marcada como procesada")
                        else:
                            print_status(
                                f"Error al marcar sugerencia como procesada: {process_response.status_code} - {process_response.text}", False)
            else:
                print_status(
                    f"Error al crear sugerencia: {response.status_code} - {response.text}", False)
        except Exception as e:
            print_status(f"Error de conexión: {str(e)}", False)


def create_favorites():
    """Crear favoritos para usuarios"""
    global favorites

    print("\n=== Creando favoritos ===")

    regular_users = [user for user in users if user["user_type"] == "user"]

    if not regular_users:
        print_status("No hay usuarios para crear favoritos", False)
        return

    if not foundations and not social_actions:
        print_status(
            "No hay fundaciones o acciones sociales para marcar como favoritas", False)
        return

    for user in regular_users:
        # Decidir cuántos favoritos creará este usuario
        num_favorites = random.randint(1, FAVORITES_PER_USER)

        # Asegurarse de tener un token para este usuario
        if user["id"] not in user_tokens:
            token = login_user(user["email"], user["password"])
            if token:
                user_tokens[user["id"]] = token
            else:
                print_status(
                    f"No se pudo obtener token para {user['name']}", False)
                continue

        user_auth_headers = get_auth_headers(user["id"])

        # Crear favoritos combinando fundaciones y acciones sociales
        for _ in range(num_favorites):
            # Decidir si es fundación u oportunidad
            is_foundation = random.choice([True, False])

            if is_foundation and foundations:
                # Marcar una fundación como favorita
                foundation = random.choice(foundations)
                favorite_data = {
                    "item_id": foundation["id"],
                    "item_type": "foundation"
                }

                try:
                    response = requests.post(
                        f"{BASE_URL}/users/{user['id']}/favorites",
                        json=favorite_data,
                        headers=user_auth_headers
                    )

                    if response.status_code in [200, 201]:
                        favorite_info = response.json()
                        favorites.append(favorite_info)
                        print_status(f"Fundación marcada como favorita")
                    else:
                        if "already in favorites" in response.text:
                            print_status(
                                "Fundación ya estaba en favoritos", False)
                        else:
                            print_status(
                                f"Error al marcar favorito: {response.status_code} - {response.text}", False)
                except Exception as e:
                    print_status(f"Error de conexión: {str(e)}", False)

            elif not is_foundation and social_actions:
                # Marcar una acción social como favorita
                action = random.choice(social_actions)
                favorite_data = {
                    "item_id": action["id"],
                    "item_type": "opportunity"
                }

                try:
                    response = requests.post(
                        f"{BASE_URL}/users/{user['id']}/favorites",
                        json=favorite_data,
                        headers=user_auth_headers
                    )

                    if response.status_code in [200, 201]:
                        favorite_info = response.json()
                        favorites.append(favorite_info)
                        print_status(f"Oportunidad marcada como favorita")
                    else:
                        if "already in favorites" in response.text:
                            print_status(
                                "Oportunidad ya estaba en favoritos", False)
                        else:
                            print_status(
                                f"Error al marcar favorito: {response.status_code} - {response.text}", False)
                except Exception as e:
                    print_status(f"Error de conexión: {str(e)}", False)


def main():
    """Función principal que ejecuta el proceso de población de la base de datos"""
    print("=== INICIANDO POBLACIÓN DE LA BASE DE DATOS ===")
    print("Este script creará datos realistas y relacionados entre sí.")
    print("Se crearán:")
    print(f"- {NUM_REGULAR_USERS} usuarios regulares")
    print(f"- {NUM_FOUNDATION_USERS} usuarios de fundaciones")
    print(
        f"- Donaciones (aproximadamente {NUM_REGULAR_USERS * DONATIONS_PER_USER / 2})")
    print(
        f"- Acciones sociales (aproximadamente {NUM_FOUNDATION_USERS * SOCIAL_ACTIONS_PER_FOUNDATION})")
    print(f"- Y muchos otros datos relacionados (comentarios, calificaciones, etc.)")

    # Esperar a que el servidor esté listo
    print(f"\nAsegúrate de que el servidor esté en ejecución en {BASE_URL}")
    print(f"API URL: {BASE_URL}")
    print(f"Auth URL: {AUTH_URL}")
    input("Presiona Enter para comenzar la población de datos...")

    try:
        # Probar conexión a la API
        print("\nProbando conexión a la API...")
        try:
            response = requests.get(f"{BASE_URL}/users")
            print(f"Respuesta de API: {response.status_code}")
            if response.status_code == 401:
                print("Respuesta 401 - Autenticación requerida (esperado)")
            elif response.status_code >= 400:
                print(
                    f"Advertencia: API respondió con error {response.status_code}")
        except Exception as e:
            print(f"Error al conectar con la API: {str(e)}")
            print(
                "Verifique que el servidor esté en ejecución o presione Ctrl+C para cancelar")
            input("Presione Enter para continuar de todos modos...")

        # Crear datos en el orden correcto para mantener integridad referencial
        create_users()
        time.sleep(1)  # Pequeña pausa entre operaciones

        create_foundations()
        time.sleep(1)

        create_donations()
        time.sleep(1)

        create_social_actions()
        time.sleep(1)

        create_comments()
        time.sleep(1)

        create_ratings()
        time.sleep(1)

        create_participation_requests()
        time.sleep(1)

        create_certificates()
        time.sleep(1)

        create_notifications()
        time.sleep(1)

        create_suggestions()
        time.sleep(1)

        create_favorites()

        print("\n=== POBLACIÓN DE LA BASE DE DATOS COMPLETADA ===")
        print(f"Usuarios creados: {len(users)}")
        print(f"Fundaciones creadas: {len(foundations)}")
        print(f"Donaciones creadas: {len(donations)}")
        print(f"Acciones sociales creadas: {len(social_actions)}")
        print(f"Comentarios creados: {len(comments)}")
        print(f"Calificaciones creadas: {len(ratings)}")
        print(
            f"Solicitudes de participación creadas: {len(participation_requests)}")
        print(f"Certificados creados: {len(certificates)}")
        print(f"Notificaciones creadas: {len(notifications)}")
        print(f"Sugerencias creadas: {len(suggestions)}")
        print(f"Favoritos creados: {len(favorites)}")

    except Exception as e:
        print(f"\nERROR GENERAL: {str(e)}")
        print("Proceso interrumpido debido a un error.")
    except KeyboardInterrupt:
        print("\nProceso interrumpido por el usuario.")


if __name__ == "__main__":
    main()
