import { Router } from "express";
import { PaymentController } from "./payment.controller";
// import { PaymentController } from "./payment.controller";
// import { checkAuth } from "../../middlewares/checkAuth";

export const PaymentRoute = Router()

// PaymentRoute.post(
//     "/init-payment/:bookingId",
//     PaymentController.initPayment
// )

PaymentRoute.post(
    "/success",
    PaymentController.successPayment
)

// PaymentRoute.post(
//     "/fail",
//     PaymentController.failPayment
// )

// PaymentRoute.post(
//     "/cancel",
//     PaymentController.cancelPayment
// )

// PaymentRoute.get(
//     "/invoice/:paymentId",
//     checkAuth("ADMIN", "SUPER_ADMIN", "USER"),
//     PaymentController.getInvoiceDownloadUrl
// )

// PaymentRoute.post(
//     "/validate-payment",
//     PaymentController.validatePayment
// )