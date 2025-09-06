precision mediump float;                
                
in vec3 normal;
in vec3 fragment;
in vec3 oColor;

out vec4 color;
                
uniform vec3 light_position;
uniform vec3 light_color;

// Ambient lighting
const vec3 ambientLightColor = vec3(3.0, 3.0, 3.0);
const float ambientIntensity = 0.67;

// Diffuse lighting
//const vec3 lightDirection = normalize(vec3(3.9, 4.3, 1.7));

void main() {

    vec3 viewPos = vec3(1.0, 2.0, 5.0);

    vec3 diffuseLightColor = light_color * oColor;
    vec3 lightDirection = normalize(light_position - fragment);

    float diffuseIntensity = max(dot(normalize(normal), lightDirection), 0.0);
    vec3 diffuse = diffuseLightColor * diffuseIntensity * .85;

    vec3 ambient = clamp (ambientLightColor * ambientIntensity * 0.0, 1.0, 1.0);

    float specularStrength = 0.72;

    vec3 viewDir = normalize(viewPos - fragment);
    vec3 reflectDir = reflect(-lightDirection, normalize(normal));

    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = specularStrength * spec * light_color;

    color = vec4((ambient * (diffuse + specular)) * 2.0, 1.0);
}