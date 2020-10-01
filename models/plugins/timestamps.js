const moment = require('moment-timezone');

module.exports = function timestamp(schema) {
    let dateZone = moment.tz(Date.now(), "Asia/Jakarta");
    // Add the two fields to the schema
    schema.add({
        created_at: {
            type: Date,
            default: dateZone
        },
        updated_at: {
            type: Date,
            default: dateZone
        },
        deleted_at: {
            type: Date,
            default: dateZone
        }
    })

    // Create a pre-save hook
    schema.pre('save', (next) => {
        let now = moment.tz(Date.now(), "Asia/Jakarta");

        this.updated_at = now
        
        if (!this.created_at)
            this.created_at = now

        next();
    })
}