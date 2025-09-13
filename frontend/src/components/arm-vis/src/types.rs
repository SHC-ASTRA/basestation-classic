use std::ops::{Add, AddAssign, Sub};
use urdf_rs::{JointType};

// TODO turn these into structs 

pub type LinkOrigin = (f32,f32,f32); 

#[derive(Clone)]
pub struct LinkO {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

impl Default for LinkO {
    fn default() -> Self {
        Self { 
            x: 0.0, 
            y: 0.0, 
            z: 0.0, 
        }
    } 
}

impl LinkO {
    pub fn set(&mut self, data: [f32;3]) -> () {
        self.x = data[0];
        self.y = data[1];
        self.z = data[2];
    }

    pub fn get_vec(&mut self) -> glm::Vec3 {
        return glm::vec3(self.x, self.y, self.z);
    }
}

impl Add for LinkO {
    type Output = Self;

    fn add(self, rhs: Self) -> Self::Output {
        Self {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
            z: self.z + rhs.z,
        }
    }
}

impl AddAssign for LinkO {
    fn add_assign(&mut self, rhs: Self) {
        *self = Self {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
            z: self.z + rhs.z, 
        }
    }
}

#[derive(Clone)]
pub struct JointA {
    x: f64, 
    y: f64, 
    z: f64,
}

impl JointA {
    pub fn new() -> Self {
        Self { 
            x: 0.0, 
            y: 0.0, 
            z: 0.0,
        }
    }

    pub fn set(&mut self, data: [f64;3]) -> () {
        self.x = data[0];
        self.y = data[1];
        self.z = data[2];
    }
}

pub type JointAxis = (f64,f64,f64);
//LinkOrigin: Distance from the previous part's origin
//JointAxis: Rotation axis for this Links parent joint
//JointType: Joint type for parent joint 
//LinkOrigin: Distance from robot model origin
pub type ArmSegment = (LinkOrigin, JointAxis, JointType, LinkOrigin);

#[derive(Clone)]
pub struct ArmSeg {
    origin_offset   : LinkO, 
    rotation_axis   : JointA,
    joint_type      : JointType,
    segment_origin  : LinkO,  
}

impl ArmSeg {
    pub fn new(offset: LinkO, rot_axis: JointA, joint_type: JointType, origin: LinkO) -> Self {
        Self { 
            origin_offset   : offset, 
            rotation_axis   : rot_axis, 
            joint_type      : joint_type, 
            segment_origin  : origin, 
        }
    }
}

pub type VisObject = (ArmSegment);
