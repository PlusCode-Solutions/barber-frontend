import { useUserBookings } from "../../features/bookings/hooks/useUserBookings";
import { Table } from "../../components/shared/Table";

export default function BookingsPage() {
    const { bookings, loading } = useUserBookings();

    if (loading) return <p>Cargando tus citas...</p>;

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Mis citas</h1>

            <Table
                data={bookings}
                columns={[
                    { header: "Servicio", accessor: "service.name" },
                    { header: "Precio", accessor: "service.price" },
                    { header: "Fecha", accessor: "date" },
                    { header: "Inicio", accessor: "startTime" },
                    { header: "Fin", accessor: "endTime" },
                    { header: "Notas", accessor: "notes" },
                ]}
            />
        </div>
    );
}
