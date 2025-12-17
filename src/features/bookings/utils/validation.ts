export interface FormValidationError {
    field: string;
    message: string;
}

export function validateBookingForm(data: {
    selectedService: any | null;
    selectedBarber: any | null;
    selectedDate: string;
    selectedSlot: string;
}): FormValidationError[] {
    const errors: FormValidationError[] = [];

    if (!data.selectedService) {
        errors.push({ field: 'service', message: 'Debes seleccionar un servicio' });
    }

    if (!data.selectedBarber) {
        errors.push({ field: 'barber', message: 'Debes seleccionar un barbero' });
    }

    if (!data.selectedDate) {
        errors.push({ field: 'date', message: 'Debes seleccionar una fecha' });
    } else {
        // Validate date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(data.selectedDate);
        if (selectedDate < today) {
            errors.push({ field: 'date', message: 'La fecha no puede ser en el pasado' });
        }
    }

    if (!data.selectedSlot) {
        errors.push({ field: 'slot', message: 'Debes seleccionar un horario' });
    }

    return errors;
}
