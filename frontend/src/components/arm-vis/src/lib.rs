mod open_gl;
mod types;
use types::*;
use open_gl::*;
use std::{sync::Arc, u32};

use std::ops::{Deref, Neg};
use glow::*;
use nalg::UnitQuaternion;
use wasm_bindgen::{prelude::wasm_bindgen};
use web_sys::*;

use wasm_bindgen::JsCast;
use urdf_rs::{self, Link};
use urdf_rs::{JointType};

extern crate nalgebra as nalg;
extern crate nalgebra_glm as glm;

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

const WIDTH: u32    = 800;
const HIEGHT: u32   = 900;



struct ArmModel {
    model_objects: Vec<ArmObject>,
}

// TODO Could remove the entire ArmModel struct
impl ArmModel {
    fn new() -> Self {
        Self {
            model_objects: Vec::new()
        }
    }

    fn rotate_joints(&mut self, gl: &Arc<Context>, angles: &[f32]) -> () {
        
        let mut obj_origin: LinkOrigin = (0.0, 0.0, 0.0);
        let mut axis_number = 0;
        let mut prev_orientation:Option<glm::Quat> = Some(glm::quat_identity());

        for obj in &mut self.model_objects.iter_mut() {
            if obj.urdf_data.2 != JointType::Fixed {
                // log(obj.name.as_str());
                //prev_orientation = Some(obj.mesh.gen_quaternion(gl, angle, &obj.geo_data.1));

                if axis_number == 0 {
                    prev_orientation = Some(obj.rot_first(gl, angles[axis_number], &mut obj_origin));
                } else {

                    prev_orientation = Some(obj.rot_following(gl, angles[axis_number], &prev_orientation.unwrap(), &mut obj_origin));
                }
                //log("Rotation axis");
                //log(obj.urdf_data.1.0.to_string().as_str());
                //log(obj.urdf_data.1.1.to_string().as_str());
                //log(obj.urdf_data.1.2.to_string().as_str());
                axis_number += 1;
            }
        }
    }

    fn push_object(&mut self, obj_name: String, obj_data: ArmSegment, obj_mesh: ObjMesh, color: [f64;4]) -> () {
        let mut obj = ArmObject::new(obj_name, obj_data, obj_mesh, color);
        //obj.set_color(color);
        self.model_objects.push(obj);
    }
    
    //Initailze the Arm model
    fn init(&mut self, gl: &glow::Context) -> () {
        self.model_objects.iter_mut().for_each(|obj| {
            obj.set_revolute_axis();
            obj.init(gl);

        });
    }

    fn translate(&mut self, gl: &glow::Context, x: f32, orientation: f32, z: f32) -> () {
        self.model_objects.iter_mut().for_each(|obj| {
            obj.mesh.translate(gl, x, orientation, z);
        });
    }

    //Rotate the nth movable joint
    fn rotate_nth_joint(&mut self, gl: &glow::Context, angle: f32, axis_number: u32) -> () {

        let mut hit = 0;
        let mut obj_origin: LinkOrigin = (0.0, 0.0, 0.0);
        let mut prev_orientation: Option<glm::Quat> = None;
        for obj in self.model_objects.iter_mut() {

            if  hit <= axis_number {

                if obj.urdf_data.2 != JointType::Fixed {
                    hit += 1;
                }
                if hit - 1 == axis_number {
                    // log(obj.name.as_str());
                    prev_orientation = Some(obj.rot_first(gl, angle, &mut obj_origin));
                    // log("Rotation axis");
                    //log(obj.urdf_data.1.0.to_string().as_str());
                    //log(obj.urdf_data.1.1.to_string().as_str());
                    //log(obj.urdf_data.1.2.to_string().as_str());
                } else {
                    //panic!();
                }
            } else {
                // log(obj.name.as_str());
                Some(obj.rot_after(gl, angle, &prev_orientation.unwrap(), &mut obj_origin));
                // log("Rotation axis");
                //log(obj.urdf_data.1.0.to_string().as_str());
                //log(obj.urdf_data.1.1.to_string().as_str());
                //log(obj.urdf_data.1.2.to_string().as_str());
            }
        }
    }
}

struct ArmObject {
    name                : String,
    urdf_data           : ArmSegment,
    mesh                : ObjMesh,
    angle               : f32,
    orientation         : glm::Quat,
    rotation_quaternion : glm::Quat,
    color               : [f32;3], 
}

impl ArmObject {
    fn new(name: String, urdf_data: ArmSegment, mesh: ObjMesh,color: [f64;4]) -> Self {
        let c = [color[0] as f32, color[1] as f32, color[2] as f32];
        let color_data = (c[0], c[1], c[2]);
        let mut mesh = mesh;
        //log(" ");
        //log(color_data.0.to_string().as_str());
        //log(color_data.1.to_string().as_str());
        //log(color_data.2.to_string().as_str());
        
    
        Self {
            name                : name,
            urdf_data           : urdf_data,
            mesh                : mesh,
            angle               : 0.0,
            orientation         : glm::Quat::identity(),
            rotation_quaternion : glm::Quat::identity(),
            color               : c,
        }
    }
    
    fn set_revolute_axis(&mut self) -> () {
        self.rotation_quaternion = glm::quat_angle_axis(0.000001, &glm::vec3(self.urdf_data.1.0 as f32, self.urdf_data.1.1 as f32, self.urdf_data.1.2 as f32));
        self.mesh.set_quaternion_axis(self.urdf_data.1.0 as f32, self.urdf_data.1.1 as f32, self.urdf_data.1.2 as f32);
    }

    fn init(&mut self, gl: &glow::Context) -> () {
        self.set_revolute_axis();
        self.set_color(gl);
        self.mesh.translate(gl, self.urdf_data.0.0 + self.urdf_data.3.0,
                            self.urdf_data.0.1 + self.urdf_data.3.1,
                            self.urdf_data.0.2 + self.urdf_data.3.2);
    }

    fn gen_rotation_quaternion(&self, angle: f32, quat: &glm::Quat) -> glm::Quat {
        let axis = glm::vec3(self.urdf_data.1.0 as f32, self.urdf_data.1.1 as f32, self.urdf_data.1.2 as f32);
        let orientation = glm::quat_rotate(&quat, angle.to_radians(), &axis).normalize();
        
        UnitQuaternion::new(glm::vec3(0.0, 0.0, 0.0)).into_inner();
        return orientation;
    }

    fn set_color(&mut self, gl: &glow::Context) -> () {
        let color_data = (self.color[0], self.color[1], self.color[2]);
        self.mesh.set_color(gl, color_data);    
    }

    fn rot_first(&mut self, gl: &glow::Context, angle: f32, origin: &mut LinkOrigin) -> glm::Quat {

        //Move model to origin
        self.mesh.translate(gl, -(self.urdf_data.0.0 + self.urdf_data.3.0),
                            -(self.urdf_data.0.1 + self.urdf_data.3.1),
                            -(self.urdf_data.0.2 + self.urdf_data.3.2));

        //Create a copy of the origin data
        let temp = self.urdf_data.0;

        //Quaternion for rotation
        let orientation = self.gen_rotation_quaternion(angle, &glm::quat_identity());
        self.mesh.rotate_lead(gl, &orientation, angle, &mut self.urdf_data.0);
        *origin = (temp.0 - self.urdf_data.0.0 , temp.1 - self.urdf_data.0.1 ,temp.2 - self.urdf_data.0.2);
                

        // log("Angle: ");
        // log(angle.to_string().as_str());

        
        self.mesh.translate(gl, (self.urdf_data.0.0 + self.urdf_data.3.0),
                            (self.urdf_data.0.1 + self.urdf_data.3.1),
                            (self.urdf_data.0.2 + self.urdf_data.3.2));
        
        return orientation;
    }

    fn rot_following(&mut self, gl: &glow::Context, angle: f32, prev_orientation: &glm::Quat, origin: &mut LinkOrigin) -> glm::Quat {
        self.mesh.translate(gl, -(self.urdf_data.0.0 + self.urdf_data.3.0),
                            -(self.urdf_data.0.1 + self.urdf_data.3.1),
                            -(self.urdf_data.0.2 + self.urdf_data.3.2));

        

        let temp: LinkOrigin = self.urdf_data.0;
        let mut urdf_data =  self.urdf_data.clone();

        let j = glm::quat_rotate_vec3(&prev_orientation, &glm::vec3(self.urdf_data.0.0, self.urdf_data.0.1, self.urdf_data.0.2));
        urdf_data.0 = (j.x+ origin.0, j.y+ origin.1, j.z+ origin.2);

        let diff = (urdf_data.0.0 - temp.0, urdf_data.0.1 - temp.1, urdf_data.0.2 - temp.2);
        *origin = diff;

        // log("Angle: ");
        // log(angle.to_string().as_str());


        let orientation = self.gen_rotation_quaternion(angle, &prev_orientation);
     
        self.mesh.rotate_lead2(gl, &orientation, &mut urdf_data.0);
     
        self.mesh.translate(gl, (urdf_data.0.0 + self.urdf_data.3.0),
                            (urdf_data.0.1 + self.urdf_data.3.1),
                            (urdf_data.0.2 + self.urdf_data.3.2));
        return orientation;
    }

    fn rot_after(&mut self, gl: &glow::Context, angle: f32, prev_orientation: &glm::Quat, origin: &mut LinkOrigin) -> glm::Quat {
        //Move the model the to origin 
        self.mesh.translate(gl, -(self.urdf_data.0.0 + self.urdf_data.3.0),
                            -(self.urdf_data.0.1 + self.urdf_data.3.1),
                            -(self.urdf_data.0.2 + self.urdf_data.3.2));


        let temp: LinkOrigin = self.urdf_data.0;
        let mut urdf_data =  self.urdf_data.clone();

        let j = glm::quat_rotate_vec3(&prev_orientation, &glm::vec3(self.urdf_data.0.0, self.urdf_data.0.1, self.urdf_data.0.2));
        urdf_data.0 = (j.x+ origin.0, j.y+ origin.1, j.z+ origin.2);

        let diff = (urdf_data.0.0 - temp.0, urdf_data.0.1 - temp.1, urdf_data.0.2 - temp.2);
        *origin = diff;
        
        let mut orientation = self.gen_rotation_quaternion(0.0, &prev_orientation);
        //glm::quat_cross();
        self.mesh.rotate_lead2(gl, &orientation, &mut urdf_data.0);
        
        self.mesh.translate(gl, (urdf_data.0.0 + self.urdf_data.3.0),
                            (urdf_data.0.1 + self.urdf_data.3.1),
                            (urdf_data.0.2 + self.urdf_data.3.2));
        return orientation;
    }
}

// TODO Remove 'urdf_source'
struct URDF {
    urdf_source     : String,
    //joint_axis      : Vec<(f64,f64,f64)>,
    //link_data       : Vec<f64>,
    color_data      : Vec<[f64;4]>,
    segment_data    : Vec<ArmSegment> ,
}

impl URDF {
    fn new() -> Self {
        Self {
            urdf_source     : "".to_owned(),
            //joint_axis      : Vec::<(f64,f64,f64)>::new(),
            //link_data       : Vec::<f64>::new(),
            color_data      : Vec::<[f64;4]>::new(),
            segment_data    : Vec::<ArmSegment>::new(),
        }
    }

    //Creates segemnts from URDF file
    fn load_from_source(&mut self, source: &str) -> () {
        let robot = urdf_rs::read_from_string(source).unwrap();
        
        let mut offset = (0.0, 0.0, 0.0);
        let mut joint_data = (0.0,0.0,0.0);
        for i in  1..robot.links.len() - 1 {
            
            match robot.joints[i-1].joint_type {
                JointType::Fixed => {
                    joint_data = (0.0, 0.0, 0.0) ;
                },
                JointType::Revolute => {
                    joint_data = (robot.joints[i-1].axis.xyz.0[0], robot.joints[i-1].axis.xyz.0[1], robot.joints[i-1].axis.xyz.0[2]) ;
                }
                JointType::Continuous => {}
                JointType::Prismatic => {}
                JointType::Floating => {}
                JointType::Planar => {}
                JointType::Spherical => {}
            }
            
            //log(&robot.links[i-1].inertial.origin.xyz.0[0].to_string());
            //log(&robot.links[i-1].inertial.origin.xyz.0[1].to_string());
            //log(&robot.links[i-1].inertial.origin.xyz.0[2].to_string());
            //log(" ");
            
            let joint_tpye = robot.joints[i-1].joint_type.clone();
            let r = robot.materials[i-1].clone().color.unwrap().rgba.0;
            self.color_data.push(r);
            //let joint_data = (x.joints[i-1].axis.xyz.0[0], x.joints[i].axis.xyz.0[1], x.joints[i].axis.xyz.0[2]) ;
            let link_data = (robot.links[i-1].inertial.origin.xyz.0[0] as f32 * 4.5,
                             robot.links[i-1].inertial.origin.xyz.0[1] as f32 * 4.5,
                             robot.links[i-1].inertial.origin.xyz.0[2] as f32 * 4.5);
            //self.joint_axis.push((x.joints[i].axis.xyz.0[0], x.joints[i].axis.xyz.0[1], x.joints[i].axis.xyz.0[2]));
            self.segment_data.push((link_data, joint_data, joint_tpye, offset));
            offset.0 += robot.links[i-1].inertial.origin.xyz.0[0] as f32 * 4.5;
            offset.1 += robot.links[i-1].inertial.origin.xyz.0[1] as f32 * 4.5;
            offset.2 += robot.links[i-1].inertial.origin.xyz.0[2] as f32 * 4.5;
        }
        
    }

    //Print data for debugging
    fn debug_print(&mut self) -> () {
        self.segment_data.iter_mut().for_each(|x| {
            //log(x.clone().)
            //log(x.clone().0.0.to_string().as_str());
            //log(x.clone().1.1.to_string().as_str());
            //log(x.clone().1.2.to_string().as_str());
        })
    }
}

struct URDF2 {
    urdf_source     : String,
    segment_data    : Vec<ArmSeg>,
}

impl URDF2 {
    fn new() -> Self {
        Self {
            urdf_source     : "".to_owned(),
            //joint_axis      : Vec::<(f64,f64,f64)>::new(),
            //link_data       : Vec::<f64>::new(),
            segment_data    : Vec::<ArmSeg>::new(),
        }
    }

    //Creates segemnts from URDF file
    fn load_from_source(&mut self, source: &str) -> () {
        let robot = urdf_rs::read_from_string(source).unwrap();
        let mut offset = LinkO::default();
        

        for i in  1..robot.links.len() - 1 {
            let mut joint_data = JointA::new();
            match robot.joints[i-1].joint_type {
                JointType::Fixed => {
                    //joint_data = (0.0, 0.0, 0.0) ;
                },
                JointType::Revolute => {
                    joint_data.set([robot.joints[i-1].axis.xyz.0[0], robot.joints[i-1].axis.xyz.0[1], robot.joints[i-1].axis.xyz.0[2]]);
                }
                JointType::Continuous => {}
                JointType::Prismatic => {}
                JointType::Floating => {}
                JointType::Planar => {}
                JointType::Spherical => {}
            }
            
            //log(&robot.links[i-1].inertial.origin.xyz.0[0].to_string());
            //log(&robot.links[i-1].inertial.origin.xyz.0[1].to_string());
            //log(&robot.links[i-1].inertial.origin.xyz.0[2].to_string());
            //log(" ");
            
            let joint_tpye = robot.joints[i-1].joint_type.clone();
            //let r =  robot.materials[i-1].color.unwrap().rgba.0;

            let mut link_data= LinkO::default();
            link_data.set ([robot.links[i-1].inertial.origin.xyz.0[0] as f32 * 4.5,
                             robot.links[i-1].inertial.origin.xyz.0[1] as f32 * 4.5,
                             robot.links[i-1].inertial.origin.xyz.0[2] as f32 * 4.5]);
            
            let segment = ArmSeg::new(link_data, joint_data, joint_tpye, offset.clone());

            self.segment_data.push(segment);
            offset.x += robot.links[i-1].inertial.origin.xyz.0[0] as f32 * 4.5;
            offset.y += robot.links[i-1].inertial.origin.xyz.0[1] as f32 * 4.5;
            offset.z += robot.links[i-1].inertial.origin.xyz.0[2] as f32 * 4.5;
        }
        
    }

}

struct VisColors {
    back_ground_color   : (f32, f32, f32),
    light_color         : (f32, f32, f32),
    ambient_color       : (f32, f32, f32),
}

impl VisColors {
    fn new() -> Self {
        Self { 
            back_ground_color   : (1.0, 1.0, 1.0), 
            light_color         : (1.0, 1.0, 1.0), 
            ambient_color       : (1.0, 1.0, 1.0), 
        }
    }

    fn set_background(&mut self) -> () {
        
    }

    fn set_light(&mut self) -> () {

    }

    fn set_ambient(&mut self) -> () {

    }
}

#[wasm_bindgen]
pub struct ArmVis {
    gl              : Arc<glow::Context>,
    //app_time        : Time,
    //geometry        : ObjMesh,
    colors          : VisColors,
    vert_shader     : String,
    frag_shader     : String,
    //axis0           : ObjMesh,
    //axis1           : ObjMesh,
    //axis2           : ObjMesh,
    //axis3           : ObjMesh,
    //light_source    : ObjMesh,
    camera          : Camera,
    program         : Option<WebProgramKey>,
    uniforms        : GlUniforms,
    stl             : String,
    model_sources   : Vec<String>,
    urdf            : URDF,
    arm_models      : ArmModel,
}
 
// TODO Refactor and create init method
// TODO Add diagnostic data output for better debugging
// TODO Derive reference frames? (Might not add if URDF works really well)
// TODO Add URDF compatibility
// TODO Add method for joint angle input
// TODO Add VAOs for link colors and a way to control it from the TS side
// TODO Control background color from TS side
// TODO Add Shader of some kind. Mostly for depth information
// TODO Add Comments
#[wasm_bindgen]
impl ArmVis {

    pub fn new(canvas_ctx: WebGl2RenderingContext) -> Self {
        //Handel to the canvas
        //let canvas = web_sys::window()
        //        .expect("1")
        //        .document()
        //        .expect("2")
                //.get_elements_by_class_name(canvas_id.as_str())
        //        .get_element_by_id(canvas_ctx.as_str())
                //.unwrap()
                //.item(0)
        //        .expect("3")
        //        .dyn_into::<web_sys::HtmlCanvasElement>()
        //        .expect("4");

        

        //log("Here");
        //Set the canvas width and height
        //canvas.set_width(WIDTH);
        //canvas.set_height(HIEGHT);
        
        //Get the WebGL context
        let gl = &Arc::new(glow::Context::from_webgl2_context(canvas_ctx));

        //let gl = &Arc::new(glow::Context::from_webgl2_context(canvas
        //    .get_context("webgl2")
        //    .unwrap()
        //    .unwrap()
        //    .dyn_into::<web_sys::WebGl2RenderingContext>()
        //    .unwrap()));
        Self { 
            gl              : gl.clone(),
            //app_time        : Time::new(), 
            //geometry        : ObjMesh::new(gl),
            colors          : VisColors::new(), 
            //light_source    : ObjMesh::new(gl),
            vert_shader     : String::new(),
            frag_shader     : String::new(),
            camera          : Camera::new(),
            program         : None,
            uniforms        : GlUniforms::new(), 
            stl             : "".to_owned(),
            model_sources   : Vec::<String>::new(),
            urdf            : URDF::new(),
            arm_models      : ArmModel::new(),
            //frame_count     : 0,
        }
    }

    pub fn load_shaders(&mut self, vert_shader: String, frag_shader: String) -> () {
        //log("TEST2");
        //log(vert_shader.clone().as_str());
        self.vert_shader = vert_shader;
        self.frag_shader = frag_shader;
    }

    //Offset the Arm model
    pub fn translate(&mut self, x: f32, orientation: f32, z: f32) -> () {
        self.arm_models.translate(&self.gl, x, orientation, z);
    }

    //Rotate a specific joint 
    pub fn rotate(&mut self, x: f32, orientation: u32) -> () {
        //self.arm_models.rotate_nth(&self.gl, x, orientation);
        self.arm_models.rotate_nth_joint(&self.gl, x, orientation);
    }

    //Update the angles for all the joints
    pub fn update_joint_angles(&mut self, angles: &[f32]) -> () {
        self.arm_models.rotate_joints(&self.gl, angles);
    }

    pub fn translate_camera(&mut self, x: f32, orientation: f32, z: f32) -> () {
        self.camera.translate_orbit(x, orientation, z);
        self.camera.update_view_matrix();
    }
    
    //Load in a stl file
    pub fn push_model_sources(&mut self, stl_source: String) -> () {
        self.model_sources.push(stl_source);
    }

    //Set ArmVis colors
    pub fn set_colors(&mut self) -> () {
        self.colors.set_background();
        self.colors.set_ambient();
        self.colors.set_light();
    }

    //Initailize the Arm model from the stl files and urdf file
    pub fn init(&mut self) -> () {
        for i in 0..self.model_sources.len() {
            self.arm_models.push_object("Segment_".to_string()+i.to_string().as_str(), 
                                        self.urdf.segment_data[i].clone(), 
                                        ObjMesh::creator(&self.gl, &self.model_sources[i]), 
                                        self.urdf.color_data[i]);
        }
        self.arm_models.init(&self.gl);
    }

    fn draw(&mut self) -> () {
        for obj in self.arm_models.model_objects.iter_mut() {
            obj.mesh.draw(&self.gl);
        }
    }

    //Load in a urdf file for the arm
    pub fn push_urdf_source(&mut self, urdf_source: &str) -> () {
        self.urdf.load_from_source(urdf_source);
    }

    pub fn main(&mut self) -> () {
        console_error_panic_hook::set_once();
        unsafe {

            // Create a context from a WebGL2 context on wasm32 targets
            //#[cfg(target_arch = "wasm32")]
            
            //OpenGL Version
            let shader_version = {
                "#version 300 es"
            };
            
            //OpenGL shader program
            self.program = Some(self.gl.create_program().expect("Cannot create program"));
            
            let shader_sources = [
                (glow::VERTEX_SHADER, self.vert_shader.clone()),
                (glow::FRAGMENT_SHADER, self.frag_shader.clone()),
            ];

            let mut shaders = Vec::with_capacity(shader_sources.len());
            
            for (shader_type, shader_source) in shader_sources.iter() {
                let shader = self.gl
                    .create_shader(*shader_type)
                    .expect("Cannot create shader");
                self.gl.shader_source(shader, &format!("{}\n{}", shader_version, shader_source));
                self.gl.compile_shader(shader);
                if !self.gl.get_shader_compile_status(shader) {
                   panic!("{}", self.gl.get_shader_info_log(shader));
                }
                self.gl.attach_shader(self.program.unwrap(), shader);
                shaders.push(shader);
            }
            
            self.gl.link_program(self.program.unwrap());
            if !self.gl.get_program_link_status(self.program.unwrap()) {
                panic!("{}", self.gl.get_program_info_log(self.program.unwrap()));
            }
            
            for shader in shaders {
                self.gl.detach_shader(self.program.unwrap(), shader);
                self.gl.delete_shader(shader);
            }
            
            self.gl.use_program(Some(self.program.unwrap()));
            self.gl.clear_color(1.0, 1.0, 1.0, 1.0);

                
            self.gl.enable(glow::DEPTH_TEST|glow::LINE_SMOOTH);
            let fov: f32 = 45.0;
            let projection = glm::perspective(WIDTH as f32/HIEGHT as f32, fov, 0.01, 100.0);
            self.gl.uniform_matrix_4_f32_slice(self.uniforms.set_get_projection(&self.gl, self.program.unwrap(),"projection").as_ref(), false, projection.as_slice());
 
            let mut model = glm::Mat4::identity();
            let angle_model_transform: f32 = 90.0;
            model = glm::rotate(&model, angle_model_transform.to_radians(), &glm::vec3(-1.0, 0.0, 0.0));
            self.gl.uniform_matrix_4_f32_slice(self.uniforms.set_get_model(&self.gl, self.program.unwrap(),"model").as_ref(), false, model.as_slice());
                
            let mut view = glm::Mat4::identity();
            view  = self.camera.get_view_matrix();
            self.gl.uniform_matrix_4_f32_slice(self.uniforms.set_get_view(&self.gl, self.program.unwrap(),"view").as_ref(), false, view.as_slice());
                
      
                
            let mut transform = glm::translate(&glm::Mat4::identity(), &glm::vec3(0.0, 0.0, 0.0));
            transform = glm::rotate(&transform, 0.0 as f32, &glm::vec3(0.0, 0.0, 0.0));
            self.gl.uniform_matrix_4_f32_slice(self.uniforms.set_get_transform(&self.gl, self.program.unwrap(),"transform").as_ref(), false, transform.as_slice());

            let noraml_matrix = glm::inverse_transpose(model);
            self.gl.uniform_matrix_4_f32_slice(self.uniforms.set_get_normal_matrix(&self.gl, self.program.unwrap(),"noraml_matrix").as_ref(), false, noraml_matrix.as_slice());
            

            let light_color = glm::vec3(1.0, 1.0, 1.0);
            self.gl.uniform_3_f32_slice(self.uniforms.set_get_light_color(&self.gl, self.program.unwrap(), "light_color").as_ref(), light_color.as_slice());

            let light_position = glm::vec3(1.0, 3.4, 5.2);
            self.gl.uniform_3_f32_slice(self.uniforms.set_get_light_position(&self.gl, self.program.unwrap(), "light_position").as_ref(), light_position.as_slice());
                
            self.gl.clear(glow::COLOR_BUFFER_BIT| glow::DEPTH_BUFFER_BIT);
            self.gl.line_width(2.0);

            for i in 0..self.model_sources.len() {
                //self.arm_models.model_objects[i].mesh.draw(&self.gl);
                self.draw();
            }

            self.gl.delete_program(self.program.unwrap());
            //self.gl.delete_vertex_array(self.geometry.vao.get_vao_handle());
            //self.gl.delete_vertex_array(self.axis0.vao_position.array_handle);

        }
    }
}

#[derive(Clone)]
struct ObjMesh {
    vao             : Vao,
    //vao_color       : Vao,
    vbo_position    : Vbo,
    vbo_normals     : Vbo,
    vbo_color       : Vbo, 
    color           : (f32, f32, f32),
    ebo             : Ebo,
    quaternion      : glm::Quat,
    verts           : Vec<f32>,
    verts_copy      : Vec<f32>,
    indices         : Vec<u16>,
    normals         : Vec<u16>,
    //inverted        : bool,
}

impl ObjMesh {
    fn new(gl: &glow::Context) -> Self {
        //unsafe {
            let vao_p = Vao::new(gl, 0, 3, glow::FLOAT, false, 0, 0);
            let vbo_c = Vbo::new(gl, glow::ARRAY_BUFFER, glow::STATIC_DRAW);
            let vbo_p = Vbo::new(gl, glow::ARRAY_BUFFER, glow::STATIC_DRAW);
            let vbo_n = Vbo::new(gl, glow::ARRAY_BUFFER, glow::STATIC_DRAW);
            let ebo = Ebo::new(gl, glow::ELEMENT_ARRAY_BUFFER, glow::STATIC_DRAW);

            Self { 
                vao             : vao_p,
                vbo_position    : vbo_p,
                vbo_normals     : vbo_n,
                vbo_color       : vbo_c,
                color           : (0.0, 0.0, 0.0),
                ebo             : ebo,
                quaternion      : glm::quat_identity(),
                verts_copy      : Vec::new(),
                verts           : Vec::new(),
                indices         : Vec::new(),
                normals         : Vec::new(),
            }
        //}
    }

    fn set_quaternion_axis(&mut self, x: f32, orientation: f32, z: f32) -> () {
        self.quaternion = glm::quat_angle_axis(0.0, &glm::vec3(x, orientation, z));
    }

    fn read_in_stl(&mut self, source: &String, gl: &glow::Context) -> () {
        let mut reader = std::io::Cursor::new(source.as_str().as_bytes().to_vec());
        
        let mut x = stl_io::create_stl_reader(&mut reader).unwrap();
        let mesh = x.as_indexed_triangles().unwrap();
           
        let mut indexes = Vec::<u16>::new();
        for num in mesh.faces.clone() {
            indexes.push(num.vertices[0] as u16);
            indexes.push(num.vertices[1] as u16);
            indexes.push(num.vertices[2] as u16);
        };

        let mut verts = Vec::<f32>::new();
        for faces in mesh.vertices {
            verts.push(faces.0[0]);
            verts.push(faces.0[1]);
            verts.push(faces.0[2]);
        }

        let mut normals = Vec::<f32>::new();
        for faces in mesh.faces {
            normals.push(faces.normal.0[0]);
            normals.push(faces.normal.0[1]);
            normals.push(faces.normal.0[2]);
            normals.push(0.0);
        }
        self.new_bind(verts, indexes, &gl);

    }

    fn creator(gl: &glow::Context, source: &String) -> ObjMesh {
        let mut mesh = Self::new(gl);
        mesh.read_in_stl(source, &gl);

        return mesh;
    }

    fn translate(&mut self, gl: &glow::Context, x: f32, orientation: f32, z: f32) -> () {
        let mut i = 0;
        while i < self.verts_copy.len() {
            self.verts_copy[i] += x;
            self.verts_copy[i + 1] += orientation;
            self.verts_copy[i + 2] += z;
            i += 3;
        }
        self.refresh_vbo(&gl)
    }

    fn rotate_lead(&mut self, gl: &glow::Context, orientation: &glm::Quat, angle: f32, origin: &mut LinkOrigin) -> () {

        let mut yh:LinkOrigin;
        let j = glm::quat_rotate_vec3(&orientation, &glm::vec3(origin.clone().0, origin.clone().1, origin.clone().2));
        yh = (j.x,j.y,j.z);


        let mut i = 0;
        while i < self.verts_copy.len() {
            let temp = glm::quat_rotate_vec3(&orientation, &glm::vec3(self.verts[i], self.verts[i+1], self.verts[i+2]));
            self.verts_copy[i] = temp.x;
            self.verts_copy[i+1] = temp.y;
            self.verts_copy[i+2] = temp.z;
            i += 3;
        }

        self.refresh_vbo(&gl);
    }

    fn rotate_lead2(&mut self, gl: &glow::Context, orientation: &glm::Quat, origin: &mut LinkOrigin) -> () {

        let mut yh:LinkOrigin;
        let j = glm::quat_rotate_vec3(&orientation, &glm::vec3(origin.clone().0, origin.clone().1, origin.clone().2));
        yh = (j.x,j.y,j.z);
        //*origin = yh;

        let mut i = 0;
        while i < self.verts_copy.len() {
            let temp = glm::quat_rotate_vec3(&orientation, &glm::vec3(self.verts[i], self.verts[i+1], self.verts[i+2]));
            self.verts_copy[i] = temp.x;
            self.verts_copy[i+1] = temp.y;
            self.verts_copy[i+2] = temp.z;
            i += 3;
        }

        while i < self.normals.len() {
            let temp = glm::quat_rotate_vec3(&orientation, &glm::vec3(self.normals[i] as f32, self.normals[i+1] as f32, self.normals[i+2] as f32));
            self.normals[i] = temp.x as u16;
            self.normals[i+1] = temp.y as u16;
            self.normals[i+2] = temp.z as u16;
            i += 3;
        }

        self.refresh_vbo(&gl);
    }

    fn draw(&mut self, gl: &glow::Context) -> () {
        unsafe {
            self.vao.bind(&gl);
            
            gl.draw_elements(glow::TRIANGLES, self.ebo.get_element_count(), glow::UNSIGNED_SHORT, 0);
            
            self.vao.un_bind(&gl);
        }
    }

    fn refresh_vbo(&mut self, gl: &glow::Context) -> () {
        self.vao.bind(&gl);
        self.vbo_position.bind(&gl, self.verts_copy.as_slice(), 3, 0);
        self.vbo_normals.bind(&gl, self.verts_copy.as_slice(), 3, 1);
        let color_bufffer = self.gen_color_buffer();
        self.vbo_color.bind(&gl, color_bufffer.as_slice(), 3, 2);
        self.vao.un_bind(&gl);
    }

    fn set_color(&mut self, gl: &glow::Context, color: (f32, f32, f32)) -> () {
        self.color = color;
        self.refresh_vbo(gl);
    }

    fn gen_color_buffer(&mut self) -> Vec<f32> {
        let mut color_vec = Vec::<f32>::new();
        let mut i = 0;
        //log("Gen");
        //log(self.color.0.to_string().as_str());
        //log(self.color.1.to_string().as_str());
        //log(self.color.2.to_string().as_str());
        
        while i < self.verts.len() {
            color_vec.push(3.0 * self.color.0);
            color_vec.push(3.0 * self.color.1);
            color_vec.push(3.0 * self.color.2); 
            i += 3;
        }
        return color_vec;
    }

    fn new_bind(&mut self, vert: Vec<f32>, indexes: Vec<u16>, gl: &glow::Context) -> () {
        
        self.verts = vert;
        self.verts_copy = self.verts.clone();
        self.indices = indexes;
        let color_buf_local = self.gen_color_buffer();
        self.vao.bind(&gl);
        self.ebo.bind(&gl, self.indices.as_slice());
        self.vbo_position.bind(&gl, self.verts_copy.as_slice(), 3, 0);
        self.vbo_normals.bind(&gl, self.verts_copy.as_slice(), 3, 1);
        self.vbo_color.bind(gl, color_buf_local.as_slice(), 3, 2);
        self.vao.un_bind(&gl);
    }
}
