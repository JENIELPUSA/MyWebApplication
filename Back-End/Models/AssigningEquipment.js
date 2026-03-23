const mongoose = require('mongoose');
const Equipment = require('./../Models/Equipment');

// Define the category schema
const categorySchema = new mongoose.Schema({
    Laboratory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Laboratory',  // Reference to the Laboratory model
      },
    Equipments: { // Tinanggal ang 's'
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',  // Reference to the Equipment model
        required: true
    }
});

// Pre-hook for validating equipment availability before saving
categorySchema.pre('save', async function (next) {
    // In-update mula .Equipments tungo sa .Equipment
    if (this.Equipment) {
        const equipmentId = this.Equipment;

        console.log('Validating Equipment:', equipmentId);

        try {
            // Check if the equipment is already assigned
            const alreadyAssignedEquipment = await Equipment.findOne({
                _id: equipmentId,
                status: 'Not Available'
            });

            if (alreadyAssignedEquipment) {
                const errorMessage = `The equipment "${alreadyAssignedEquipment.name}" is already assigned and cannot be reassigned.`;
                console.error(errorMessage);
                return next(new Error(errorMessage));
            }

            console.log('Equipment is available for assignment.');
            next();
        } catch (error) {
            console.error('Error during equipment validation:', error);
            return next(error);
        }
    } else {
        next();
    }
});

// Post-hook for updating equipment status after saving the assignment
categorySchema.post('save', async function (doc, next) {
    if (doc.Laboratory && doc.Equipment) {
        const equipmentId = doc.Equipment;

        console.log('Updating status for Equipment:', equipmentId);

        try {
            await Equipment.updateOne(
                { _id: equipmentId, status: { $ne: 'Not Available' } },
                { $set: { status: 'Not Available' } }
            );
            console.log('Successfully updated status to "Not Available"!');
        } catch (error) {
            console.error('Error updating Equipment status:', error);
            return next(error);
        }
    }
    next();
});

// Post-hook for updating equipment status after deleting the assignment
categorySchema.post('findOneAndDelete', async function (doc, next) {
    if (doc && doc.Equipment) {
        const equipmentId = doc.Equipment;

        console.log('Reverting status for Equipment:', equipmentId);

        try {
            await Equipment.updateOne(
                { _id: equipmentId, status: { $ne: 'Available' } },
                { $set: { status: 'Available' } }
            );
            console.log('Successfully reverted the Equipment status to Available!');
        } catch (error) {
            console.error('Error updating Equipment status:', error);
            return next(error);
        }
    }
    next();
});

const Assign = mongoose.model('Assign', categorySchema);

module.exports = Assign;
