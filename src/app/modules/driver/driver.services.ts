import { Request } from "express";
import { Driver } from "./driver.model";
import { User } from "../user/user.model";
import { QueryBuilder } from "../../utils/QueryBuilder";


interface DriverPopulated {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isBlocked?: boolean;
  };
  approvalStatus: string;
  isOnline: boolean;
  licenseNumber?: string;
  vehicle?: string;
  totalEarnings?: number;
}

const createDriver = async (req: Request) => {

    const userId = (req.user as { userId?: string }).userId;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.findByIdAndUpdate(userId, { role: "DRIVER" })

    const driver = await Driver.create({
        user: userId,
        ...req.body
    });
    return driver
}

const setAvailability = async (req: Request) => {

    const user = (req.user as { userId?: string }).userId;
    const isOnline = req.body.isOnline;

    const driver = await Driver.findOneAndUpdate(
        { user },
        { isOnline },
        { new: true }
    )
    return driver
}

const setApprovalStatus = async (req: Request) => {

    const id = req.params.id;
    const approvalStatus = req.body.approvalStatus;

    const driver = await Driver.findByIdAndUpdate(
        id,
        { approvalStatus },
        { new: true }
    )
    return driver
}

const updateDriverProfile = async (req: Request) => {

    const driverId = (req.user as { driverId?: string }).driverId;;
    const vehicle = req.body.vehicle;
    const licenseNumber = req.body.licenseNumber;

    const driver = await Driver.findByIdAndUpdate(
        driverId,
        { vehicle, licenseNumber },
        { new: true }
    )
    return driver
}

const getAllDrivers = async (req: Request) => {
  const query = req.query as Record<string, string>;
  const searchTerm = query.searchTerm?.toLowerCase() || "";

  const queryBuilder = new QueryBuilder(
    Driver.find().populate("user"), 
    query
  );

  const driversQuery = queryBuilder
    .filter()
    .sort()
    .fields();
    // .paginate()

  let data: DriverPopulated[] = await driversQuery.build() as unknown as DriverPopulated[];

  // Post-process search on populated fields
  if (searchTerm) {
    data = data.filter(driver => {
      const name = driver.user?.name?.toLowerCase() || "";
      const email = driver.user?.email?.toLowerCase() || "";
      return name.includes(searchTerm) || email.includes(searchTerm);
    });
  }

  const meta = await queryBuilder.getMeta();

  return { data, meta };
};

export const DriverServices = {
    createDriver,
    setAvailability,
    setApprovalStatus,
    updateDriverProfile,
    getAllDrivers
}