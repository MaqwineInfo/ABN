const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const businessesSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: uuidv4, 
        },
        user_id: { 
            type: String,
            ref: "users",
            required: [true, "User ID is required"],
        },
        city_id: {
            type: String,
            ref: "cities",
            required: [true, "City ID is required"],
        },
        chapter_id: {
            type: String,
            ref: "chapters",
            required: [true, "Chapter ID is required"],
        },
        business_name: {
            type: String,
            required: [true, "Business name is required"],
            trim: true,
        },
        personal_phone_number: {
            type: String,
            required: [true, "Personal phone number is required"],
            trim: true, 
        },
        office_phone_number: {
            type: String,
            required: [true, "Office phone number is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true, 
            lowercase: true,
            validate: {
                validator: function(v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email!`
            }
        },
        web_url: {
            type: String,
            required: false,
            trim: true,
            validate: {
                validator: function (v) { 
                    if (!v) return true;
                    return /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w- ./?%&=]*)?$/.test(v);
                },
                message: props => `${props.value} is not a valid URL!`
            }
        },
        tagline: {
            type: String,
            required: [true, "Tagline is required"],
            trim: true,
        },
        profile_picture: {
            type: String,
            required: false,
            trim: true,
        },
        business_logo: {
            type: String,
            required: false,
            trim: true,
        },
        joining_date: {
            type: Date,
            required: [true, "Joining date is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        reference: {
            type: String, 
            required: false,
            trim: true,
        },
        business_card_front: {
            type: String,
            required: false,
            trim: true,
        },
        business_card_back: {
            type: String,
            required: false,
            trim: true, 
        },
          portfolio_images: {  
            type: [String],
            required: false, 
            default: [],  
        },
        office_address: {
            type: String,
            required: [true, "Office address is required"],
            trim: true,
        },
        office_address: {
            type: String,
            required: [true, "Office address is required"],
            trim: true,
        },
        office_city: {
            type: String,
            required: [true, "Office city is required"],
            trim: true,
        },
        office_district: {
            type: String,
            required: [true, "Office state is required"],
            trim: true,
        },
        office_pincode: {
            type: String,
            required: [true, "Office pincode is required"],
            trim: true,
        },
        office_latitude: {
            type: Number,
            required: [true, "Office latitude is required"],
        },
        office_longitude: {
            type: Number,
            required: [true, "Office longitude is required"],
        },
        residence_address: {
            type: String,
            required: [true, "Residence address is required"],
            trim: true,
        },
        residence_city: {
            type: String,
            required: [true, "Residence city is required"],
            trim: true,
        },
        residence_district: {
            type: String,
            required: [true, "Residence state is required"],
            trim: true,
        },
        residence_pincode: {
            type: String,
            required: [true, "Residence pincode is required"],
            trim: true,
        },
        residence_latitude: {
            type: Number,
            required: [true, "Residence latitude is required"],
        },
        residence_longitude: {
            type: Number,
            required: [true, "Residence longitude is required"],
        },
        hometown_address: {
            type: String,   
            required: [true, "Hometown address is required"],
            trim: true,
        },
        hometown_city: {
            type: String,
            required: [true, "Hometown city is required"],
            trim: true,
        },
        hometown_district: {
            type: String,
            required: [true, "Hometown state is required"],
            trim: true,
        },
        hometown_pincode: {
            type: String,
            required: [true, "Hometown pincode is required"],
            trim: true,
        },
    },
    {
        timestamps: true,
        _id: false
    }
);

module.exports = mongoose.model("businesses", businessesSchema);