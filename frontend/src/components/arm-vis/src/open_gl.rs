// TODO Refactor all OpenGL code to here

use glow::{HasContext, WebBufferKey, WebVertexArrayKey};
use web_sys::WebGlUniformLocation;

pub struct GlUniforms {
    model_uniform       : Option<WebGlUniformLocation>,
    view_uniform        : Option<WebGlUniformLocation>,
    projection_uniform  : Option<WebGlUniformLocation>,
    transform           : Option<WebGlUniformLocation>,
    light_color         : Option<WebGlUniformLocation>,
    light_position      : Option<WebGlUniformLocation>,
    arm_color           : Option<WebGlUniformLocation>,
    normal_matrix       : Option<WebGlUniformLocation>,
}

impl GlUniforms {
    pub fn new() -> Self {
        Self {
            model_uniform       : None,
            view_uniform        : None,
            projection_uniform  : None,
            transform           : None,
            light_color         : None,
            light_position      : None,
            arm_color           : None,
            normal_matrix       : None,
        }
    }

    pub fn set_get_model(&mut self, gl: &glow::Context, program: glow::WebProgramKey, name: &str) -> &Option<WebGlUniformLocation>
    {
        unsafe {
            self.model_uniform = gl.get_uniform_location(program, name);
        }
        return &self.model_uniform;
    }

    pub fn set_get_view(&mut self, gl: &glow::Context, program: glow::WebProgramKey, name: &str) -> &Option<WebGlUniformLocation>
    {
        unsafe {
            self.view_uniform = gl.get_uniform_location(program, name);
        }
        return &self.view_uniform;
    }

    pub fn set_get_projection(&mut self, gl: &glow::Context, program: glow::WebProgramKey, name: &str) -> &Option<WebGlUniformLocation> {
        unsafe {
            self.projection_uniform = gl.get_uniform_location(program, name);
        }
        return &self.projection_uniform;
    }

    pub fn set_get_transform(&mut self, gl: &glow::Context, program: glow::WebProgramKey, name: &str) -> &Option<WebGlUniformLocation>
    {
        unsafe {
            self.transform = gl.get_uniform_location(program, name);
        }
        return &self.transform;
    }

    pub fn set_get_light_color(&mut self, gl: &glow::Context, program: glow::WebProgramKey, name: &str) -> &Option<WebGlUniformLocation> {
        unsafe {
            self.light_color = gl.get_uniform_location(program, name);
        }
        return &self.light_color;
    }

    pub fn set_get_light_position(&mut self, gl: &glow::Context, program: glow::WebProgramKey, name: &str) -> &Option<WebGlUniformLocation> {
        unsafe {
            self.light_position = gl.get_uniform_location(program, name);
        }
        return &self.light_position;
    }
    
    pub fn set_get_arm_color(&mut self, gl: &glow::Context, program: glow::WebProgramKey, name: &str) -> &Option<WebGlUniformLocation> {
        unsafe {
            self.arm_color = gl.get_uniform_location(program, name);
        }
        return &self.arm_color;
    }

    pub fn set_get_normal_matrix(&mut self, gl: &glow::Context, program: glow::WebProgramKey, name: &str) -> &Option<WebGlUniformLocation> {
        unsafe {
            self.light_color = gl.get_uniform_location(program, name);
        }
        return &self.light_color;
    }
}

// TODO Fix Camera Struct
pub struct Camera {
    camera_pos          : glm::Vec3,
    camera_target       : nalg::Matrix<f32, nalg::Const<3>, nalg::Const<1>, nalg::ArrayStorage<f32, 3, 1>>,
    camera_anti_normal  : nalg::Matrix<f32, nalg::Const<3>, nalg::Const<1>, nalg::ArrayStorage<f32, 3, 1>>,
    camera_up           : nalg::Matrix<f32, nalg::Const<3>, nalg::Const<1>, nalg::ArrayStorage<f32, 3, 1>>,
    camera_right        : nalg::Matrix<f32, nalg::Const<3>, nalg::Const<1>, nalg::ArrayStorage<f32, 3, 1>>,
    camera_front        : nalg::Matrix<f32, nalg::Const<3>, nalg::Const<1>, nalg::ArrayStorage<f32, 3, 1>>,
    view_matrix         : nalg::Matrix<f32, nalg::Const<4>, nalg::Const<4>, nalg::ArrayStorage<f32, 4, 4>>,
    angle               : f32,
    distance            : f32,
}

impl Camera {
    pub fn new() -> Self {
        let camera_pos = glm::vec3(2.0, 1.0, 5.0);
        let camera_target = glm::vec3(0.0, 0.0, 0.0);
        let camera_up = glm::vec3(0.0, 1.0, 0.0);
        let camera_anti_normal = glm::normalize(&(camera_pos - camera_target));
        let camera_front = glm::vec3(0.0, 0.0, -1.0);

        Self {
            camera_pos          : camera_pos,
            camera_target       : camera_target,
            camera_anti_normal  : camera_anti_normal,
            camera_up           : camera_up,
            camera_right        : glm::normalize(&glm::cross(&camera_up, &camera_anti_normal)),
            camera_front        : camera_front,
            view_matrix         : glm::look_at(&camera_pos, &(camera_pos + camera_front), &camera_up),
            angle               : 0.0,
            distance            : 4.0,
        }
    }

    pub fn translate_orbit(&mut self, x: f32, y: f32, z: f32) -> () {
        self.angle += x/20.0;

        //self.camera_pos.x = self.angle.cos()*self.distance; //self.angle.sin() * 20.0;
        //self.camera_pos.z = self.angle.sin()*self.distance;//self.angle.cos() * 20.0;
        self.camera_front = glm::vec3(self.angle.cos(), 0.0, self.angle.sin())
        //self.camera_target = glm::vec3(x, 0.0, z);
        //self.camera_pos.x += x;
        //self.camera_pos.x += y;
        //self.camera_pos.x += z;
    }

    fn pan_xy(&mut self) -> () {

    }

    fn planar_movement(&mut self) -> () {

    }

    pub fn update_view_matrix(&mut self) -> () {
        self.view_matrix = glm::look_at(&self.camera_pos, &(self.camera_pos  + self.camera_front ), &self.camera_up);//&self.camera_up);
        //self.view_matrix = glm::look_at(&self.camera_pos, &(glm::vec3(0.0,0.0,0.0)), &self.camera_up);//&self.camera_up);
    }

    pub fn get_view_matrix(&mut self) -> nalg::Matrix<f32, nalg::Const<4>, nalg::Const<4>, nalg::ArrayStorage<f32, 4, 4>> {
        return self.view_matrix;
    }
}

#[derive(Clone)]

pub struct Ebo {
    buffer_handle   : WebBufferKey,
    target          : u32,
    usage           : u32,
    data_length     : u32,
    element_count   : i32,
}

impl Ebo {
    pub fn new(gl: &glow::Context, target: u32, usage: u32) -> Self {
        unsafe {
            let ebo = gl.create_buffer().expect("Creating Ebo");
            Self {
                buffer_handle   : ebo,
                target          : target,
                usage           : usage,
                data_length     : 0,
                element_count   : 0,
            }
        }
    }

    pub fn bind(&mut self, gl: &glow::Context, index_data: &[u16]) {
        unsafe {
            gl.bind_buffer(self.target, Some(self.buffer_handle));
            let data = bytemuck::cast_slice(&index_data[..]);
            gl.buffer_data_u8_slice(self.target, data, self.usage);
            self.data_length = data.len() as u32;
            self.element_count = index_data.len() as i32;
        }
    }
    
    pub fn get_element_count(&mut self) -> i32 {
        return self.element_count;
    }
}

#[derive(Clone)]

pub struct Vao {
    array_handle    : WebVertexArrayKey,
    index           : u32,
    size            : i32,
    target          : u32,
    normalized      : bool,
    stride          : i32,
    offset          : i32,
}

impl Vao {
    pub fn new(gl : &glow::Context, index: u32, size: i32, target: u32, normalized: bool, stride: i32, offset: i32) -> Self {
        unsafe {
            //let key = gl.create_vertex_array().expect("msg");
            Self {
                array_handle    : gl.create_vertex_array().expect("Creating Vao"),
                index           : index,
                size            : size,
                target          : target,
                normalized      : normalized,
                stride          : stride,
                offset          : offset,
            }
        }
    }

    pub fn enable(&mut self, gl: &glow::Context) {
        unsafe {
            gl.bind_vertex_array(Some(self.array_handle));
            gl.enable_vertex_attrib_array(self.index);
            gl.vertex_attrib_pointer_f32(self.index, self.size, self.target, self.normalized, self.stride, self.offset);
        }
    }

    pub fn bind(&mut self,gl: &glow::Context) -> () {
        unsafe {
            gl.bind_vertex_array(Some(self.array_handle));
        }
    }

    pub fn un_bind(&mut self, gl: &glow::Context) -> () {
        unsafe {
            gl.bind_vertex_array(None);
        }
    }
    
    pub fn get_vao_handle(&mut self) -> WebVertexArrayKey {
        return self.array_handle;
    }


}

#[derive(Clone)]

pub struct Vbo {
    buffer_handle   : WebBufferKey,
    target          : u32,
    usage           : u32,
    data_length     : u32,
}

impl Vbo {
    pub fn new(gl: &glow::Context, target: u32, usage: u32) -> Self {
        unsafe{
            let vbo = gl.create_buffer().expect("Creating Vbo");
            Self {
                buffer_handle   : vbo,
                target          : target,
                usage           : usage,
                data_length     : 0,
            }
        }
    }

    pub fn bind(&mut self, gl: &glow::Context, vertex_data: &[f32], size: i32, index: u32) {//-> &[u8] {
        unsafe {
            gl.bind_buffer(self.target, Some(self.buffer_handle));
            let data = bytemuck::cast_slice(&vertex_data[..]);
            gl.buffer_data_u8_slice(self.target, data, self.usage);
            self.data_length = data.len() as u32;

            gl.vertex_attrib_pointer_f32(index, size, glow::FLOAT, false, 0, 0);
            gl.enable_vertex_attrib_array(index);
        }
    }
}
