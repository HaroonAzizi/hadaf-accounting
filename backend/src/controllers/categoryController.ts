import type { Request, Response, NextFunction } from "express";

import { sendSuccess } from "../utils/apiResponse";
import * as categoryModel from "../models/categoryModel";

export function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = categoryModel.getAllCategories();
    return sendSuccess(res, {
      data: categories,
      message: "Categories fetched",
    });
  } catch (e) {
    return next(e);
  }
}

export function getCategoryById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const category = categoryModel.getCategoryById(id);
    if (!category) {
      return sendSuccess(res, {
        status: 404,
        data: null,
        message: "Category not found",
      });
    }
    return sendSuccess(res, { data: category, message: "Category fetched" });
  } catch (e) {
    return next(e);
  }
}

export function getCategoryStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const stats = categoryModel.getCategoryWithStats(id);
    return sendSuccess(res, { data: stats, message: "Category stats fetched" });
  } catch (e) {
    return next(e);
  }
}

export function createCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, parentId, type } = req.body as {
      name: string;
      parentId?: number | null;
      type?: string;
    };
    const category = categoryModel.createCategory({
      name,
      parentId: parentId ?? null,
      type,
    });
    return sendSuccess(res, {
      status: 201,
      data: category,
      message: "Category created",
    });
  } catch (e) {
    return next(e);
  }
}

export function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const { name, parentId } = req.body as {
      name?: string;
      parentId?: number | null;
    };
    const category = categoryModel.updateCategory({ id, name, parentId });
    return sendSuccess(res, { data: category, message: "Category updated" });
  } catch (e) {
    return next(e);
  }
}

export function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    categoryModel.deleteCategory(id);
    return sendSuccess(res, { data: true, message: "Category deleted" });
  } catch (e) {
    return next(e);
  }
}
