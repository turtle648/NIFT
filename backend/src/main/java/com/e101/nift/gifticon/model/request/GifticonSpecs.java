package com.e101.nift.gifticon.model.request;

import com.e101.nift.gifticon.entity.Gifticon;
import org.springframework.data.jpa.domain.Specification;

public class GifticonSpecs {
    public static Specification<Gifticon> containsKeyword(String term) {
        return (root, query, cb) ->
                cb.or(
                        cb.like(root.get("gifticonTitle"), "%" + term + "%"),
                        cb.like(root.get("description"), "%" + term + "%")
                );
    }

    public static Specification<Gifticon> hasCategory(Long categoryId) {
        return (root, query, cb) ->
                cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Gifticon> hasBrand(Long brandId) {
        return (root, query, cb) ->
                cb.equal(root.get("brand").get("id"), brandId);
    }
}
