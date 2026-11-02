import "server-only";
import { CsvFile } from "@/shared/infrastructure/csv/CsvFile";
import { CsvEventRepository } from "@/modules/events/infrastructure/CsvEventRepository";
import { CsvPayerRepository } from "@/modules/payers/infrastructure/CsvPayerRepository";
import { CsvExpenseRepository } from "@/modules/expenses/infrastructure/CsvExpenseRepository";

import { ListEvents } from "@/modules/events/application/ListEvents";
import { GetEvent } from "@/modules/events/application/GetEvent";
import { CreateEventWithPayers } from "@/modules/events/application/CreateEventWithPayers";
import { UpdateEvent } from "@/modules/events/application/UpdateEvent";
import { DeleteEvent } from "@/modules/events/application/DeleteEvent";

import { ListPayersByEvent } from "@/modules/payers/application/ListPayersByEvent";
import { AddPayer } from "@/modules/payers/application/AddPayer";
import { UpdatePayer } from "@/modules/payers/application/UpdatePayer";
import { DeletePayer } from "@/modules/payers/application/DeletePayer";

import { ListExpensesByEvent } from "@/modules/expenses/application/ListExpensesByEvent";
import { CreateExpense } from "@/modules/expenses/application/CreateExpense";
import { UpdateExpense } from "@/modules/expenses/application/UpdateExpense";
import { DeleteExpense } from "@/modules/expenses/application/DeleteExpense";

import { GetEventDashboard } from "@/modules/settlement/application/GetEventDashboard";

const csvFile = new CsvFile();

export const eventRepository = new CsvEventRepository(csvFile);
export const payerRepository = new CsvPayerRepository(csvFile);
export const expenseRepository = new CsvExpenseRepository(csvFile);

export const listEvents = new ListEvents(eventRepository);
export const getEvent = new GetEvent(eventRepository);
export const createEventWithPayers = new CreateEventWithPayers(eventRepository, payerRepository);
export const updateEvent = new UpdateEvent(eventRepository);
export const deleteEvent = new DeleteEvent(eventRepository, payerRepository, expenseRepository);

export const listPayersByEvent = new ListPayersByEvent(payerRepository);
export const addPayer = new AddPayer(payerRepository);
export const updatePayer = new UpdatePayer(payerRepository);
export const deletePayer = new DeletePayer(payerRepository, expenseRepository);

export const listExpensesByEvent = new ListExpensesByEvent(expenseRepository);
export const createExpense = new CreateExpense(expenseRepository, payerRepository);
export const updateExpense = new UpdateExpense(expenseRepository, payerRepository);
export const deleteExpense = new DeleteExpense(expenseRepository);

export const getEventDashboard = new GetEventDashboard(
  eventRepository,
  payerRepository,
  expenseRepository
);
