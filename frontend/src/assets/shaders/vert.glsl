layout (location = 0) in vec3 verts;
layout (location = 1) in vec4 normals;
layout (location = 2) in vec3 objColor;
            
precision mediump float;

out vec3 normal;
out vec3 fragment;
out vec3 oColor;
            
uniform mat4 transform;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 noraml_matrix;
            
void main() {
    oColor = objColor;
    normal = ( noraml_matrix * normals).xyz;
    fragment = vec3(model * vec4(verts, 1.0));
    gl_Position = projection * view * model * vec4(verts, 1.0);
}